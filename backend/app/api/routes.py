import json
import pandas as pd
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from pydantic import BaseModel, HttpUrl
import uuid
from app.core.excel_db import ExcelDB
from app.services.document_parser import extract_text_from_file, extract_text_from_url, get_url_metadata
from app.services.summarizer import generate_summary, chat_with_document
from app.api.deps import get_current_user

router = APIRouter()


class TextRequest(BaseModel):
    text: str
    length: str = "detailed"
    tone: str = "professional"


class UrlRequest(BaseModel):
    url: HttpUrl
    length: str = "detailed"
    tone: str = "professional"


@router.post("/summarize/text")
async def summarize_text(req: TextRequest, current_user: dict = Depends(get_current_user)):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    try:
        result = generate_summary(req.text, req.length, req.tone)
        result["source_text"] = req.text[:20000]
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/summarize/url")
async def summarize_url(req: UrlRequest, current_user: dict = Depends(get_current_user)):
    try:
        text = extract_text_from_url(str(req.url))
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the URL")
        result = generate_summary(text, req.length, req.tone)
        result["source_text"] = text[:20000]
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/summarize/file")
async def summarize_file(
    file: UploadFile = File(...),
    length: str = Form("detailed"),
    tone: str = Form("professional"),
    current_user: dict = Depends(get_current_user)
):
    try:
        text = await extract_text_from_file(file)
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the file")
        result = generate_summary(text, length, tone)
        result["source_text"] = text[:20000]
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    context: str
    messages: list[ChatMessage]

@router.post("/chat")
async def chat_api(req: ChatRequest, current_user: dict = Depends(get_current_user)):
    try:
        reply = chat_with_document(req.context, [m.dict() for m in req.messages])
        return {"reply": reply}
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/preview/url")
async def preview_url(url: HttpUrl):
    metadata = get_url_metadata(str(url))
    if "error" in metadata:
        raise HTTPException(status_code=400, detail=metadata["error"])
    return metadata

class HistoryCreate(BaseModel):
    label: str
    input_type: str
    sentiment: str
    summary_preview: str
    keywords: list[str]
    result: dict

class HistoryUpdate(BaseModel):
    result: dict

@router.post("/history")
async def save_history(entry: HistoryCreate, current_user: dict = Depends(get_current_user)):
    history_df = ExcelDB.get_history()
    
    new_entry = {
        "id": str(uuid.uuid4()),
        "user_email": current_user["email"],
        "label": entry.label,
        "input_type": entry.input_type,
        "sentiment": entry.sentiment,
        "summary_preview": entry.summary_preview,
        "keywords": json.dumps(entry.keywords),
        "result": json.dumps(entry.result),
        "created_at": datetime.utcnow().isoformat()
    }
    
    history_df = pd.concat([history_df, pd.DataFrame([new_entry])], ignore_index=True)
    ExcelDB.save_history(history_df)
    
    # Create notification
    notif_df = ExcelDB.get_notifications()
    new_notif = {
        "id": str(uuid.uuid4()),
        "user_email": current_user["email"],
        "title": "Analysis Complete",
        "message": f"Successfully analyzed: {entry.label}",
        "type": "success",
        "is_read": False,
        "created_at": datetime.utcnow().isoformat()
    }
    notif_df = pd.concat([notif_df, pd.DataFrame([new_notif])], ignore_index=True)
    ExcelDB.save_notifications(notif_df)
    
    return {"id": new_entry["id"]}

@router.get("/history")
async def get_history(current_user: dict = Depends(get_current_user)):
    history_df = ExcelDB.get_history()
    user_history = history_df[history_df['user_email'] == current_user["email"]].sort_values(by="created_at", ascending=False)
    
    res = []
    for _, item in user_history.iterrows():
        res.append({
            "id": str(item["id"]),
            "label": item["label"],
            "input_type": item["input_type"],
            "sentiment": item["sentiment"],
            "summaryPreview": item["summary_preview"],
            "keywords": json.loads(str(item["keywords"])) if pd.notnull(item["keywords"]) else [],
            "result": json.loads(str(item["result"])) if pd.notnull(item["result"]) else {},
            "timestamp": str(item["created_at"])
        })
    return res

@router.put("/history/{item_id}")
async def update_history(item_id: str, update_data: HistoryUpdate, current_user: dict = Depends(get_current_user)):
    history_df = ExcelDB.get_history()
    idx = history_df[(history_df['id'] == item_id) & (history_df['user_email'] == current_user["email"])].index
    if not idx.empty:
        history_df.at[idx[0], 'result'] = json.dumps(update_data.result)
        ExcelDB.save_history(history_df)
    return {"status": "ok"}

@router.delete("/history/{item_id}")
async def delete_history(item_id: str, current_user: dict = Depends(get_current_user)):
    history_df = ExcelDB.get_history()
    history_df = history_df[~((history_df['id'] == item_id) & (history_df['user_email'] == current_user["email"]))]
    ExcelDB.save_history(history_df)
    return {"status": "ok"}

@router.delete("/history")
async def clear_all_history(current_user: dict = Depends(get_current_user)):
    history_df = ExcelDB.get_history()
    history_df = history_df[history_df['user_email'] != current_user["email"]]
    ExcelDB.save_history(history_df)
    return {"status": "ok"}

@router.get("/history/search")
async def search_history(q: str, current_user: dict = Depends(get_current_user)):
    history_df = ExcelDB.get_history()
    user_history = history_df[history_df['user_email'] == current_user["email"]]
    mask = user_history['label'].astype(str).str.contains(q, case=False, na=False) | \
           user_history['summary_preview'].astype(str).str.contains(q, case=False, na=False)
    filtered = user_history[mask].sort_values(by="created_at", ascending=False).head(10)
    
    res = []
    for _, item in filtered.iterrows():
        res.append({
            "id": str(item["id"]),
            "label": item["label"],
            "summaryPreview": item["summary_preview"],
            "timestamp": str(item["created_at"])
        })
    return res

@router.get("/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    df = ExcelDB.get_notifications()
    user_notifs = df[df['user_email'] == current_user["email"]].sort_values(by="created_at", ascending=False).head(20)
    # Ensure booleans and strings are handled
    return user_notifs.to_dict(orient="records")

@router.post("/notifications/read/{notif_id}")
async def mark_notification_read(notif_id: str, current_user: dict = Depends(get_current_user)):
    df = ExcelDB.get_notifications()
    idx = df[(df['id'] == notif_id) & (df['user_email'] == current_user["email"])].index
    if not idx.empty:
        df.at[idx[0], 'is_read'] = True
        ExcelDB.save_notifications(df)
    return {"status": "ok"}
