import json
import re
from collections import Counter

from groq import Groq

from app.core.config import settings

MODEL_ID = "llama-3.3-70b-versatile"
MAX_CONTEXT_WORDS = 6000
MAX_OUTPUT_TOKENS = 2048

_client: Groq | None = None

STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "have",
    "in", "is", "it", "its", "of", "on", "or", "that", "the", "their", "this", "to",
    "was", "were", "will", "with", "about", "after", "all", "also", "any", "because",
    "been", "before", "being", "between", "both", "can", "could", "did", "does", "each",
    "few", "had", "into", "more", "most", "other", "over", "such", "than", "then", "them",
    "there", "these", "they", "those", "through", "under", "using", "very", "what", "when",
    "where", "which", "while", "who", "why", "your"
}

POSITIVE_WORDS = {
    "good", "great", "strong", "growth", "improve", "improved", "positive", "success",
    "effective", "benefit", "benefits", "efficient", "opportunity", "opportunities", "gain",
    "gains", "valuable", "confident", "innovation", "innovative", "sustainable", "progress"
}

NEGATIVE_WORDS = {
    "bad", "decline", "declined", "negative", "risk", "risks", "loss", "losses", "issue",
    "issues", "problem", "problems", "concern", "concerns", "weak", "failure", "difficult",
    "challenge", "challenges", "expensive", "delay", "delays", "threat"
}


def get_client() -> Groq | None:
    global _client
    if _client is not None:
        return _client
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "your_groq_api_key_here":
        return None
    _client = Groq(api_key=settings.GROQ_API_KEY)
    return _client


def _build_prompt(text: str, tone: str) -> str:
    tone_instruction = (
        "Use a formal, professional business tone."
        if tone == "professional"
        else "Use a friendly, casual, conversational tone."
    )

    return f"""You are an expert document analyst and summarization assistant.

Analyze the following text and return a structured JSON response with EXACTLY these fields:

{{
  \"summary_concise\": \"<A clear, brief 1-2 sentence summary of the entire text>\",
  \"summary_detailed\": \"<A thorough, comprehensive 4-6 sentence detailed summary>\",
  \"key_points\": [\"<point 1>\", \"<point 2>\", \"<point 3>\", \"...\"],
  \"important_insights\": [\"<insight 1>\", \"<insight 2>\", \"...\"],
  \"keywords\": [\"<keyword1>\", \"<keyword2>\", \"<keyword3>\", \"...up to 8 keywords>\"],
  \"metadata_insights\": {{
    \"detected_topic\": \"<Main topic or subject matter>\",
    \"reading_difficulty\": \"<Beginner | Intermediate | Advanced | Expert>\",
    \"content_complexity\": \"<Low | Medium | High | Very High>\",
    \"estimated_audience\": \"<Target audience demographic>\",
    \"category\": \"<Industry or broad category>\",
    \"writing_style\": \"<e.g., Analytical, Narrative, Persuasive, Academic>\"
  }},
  \"tone_analysis\": {{
    \"overall_tone\": \"<e.g. Informative, Persuasive, Analytical, Critical, Neutral>\",
    \"sentiment\": \"<Positive | Negative | Neutral>\",
    \"formality\": \"<Formal | Semi-Formal | Informal>\",
    \"confidence\": \"<High | Medium | Low>\",
    \"confidence_score\": <integer 0-100 representing confidence percentage>,
    \"sentiment_scores\": {{
      \"positive\": <integer 0-100>,
      \"negative\": <integer 0-100>,
      \"neutral\": <integer 0-100>
    }}
  }}
}}

Rules:
- {tone_instruction}
- Only use information from the provided text.
- Return ONLY valid JSON with no markdown or code fences.
- key_points and important_insights must be arrays of strings.
- keywords must be single words or short phrases.
- sentiment_scores.positive + sentiment_scores.negative + sentiment_scores.neutral must equal 100 exactly.

TEXT TO ANALYZE:
\"\"\"
{text}
\"\"\"
"""


def _chunk_text(text: str, max_words: int = MAX_CONTEXT_WORDS) -> list[str]:
    words = text.split()
    return [" ".join(words[i:i + max_words]) for i in range(0, len(words), max_words)]


def _call_groq(prompt: str, max_tokens: int = MAX_OUTPUT_TOKENS) -> str:
    client = get_client()
    if client is None:
        raise RuntimeError("Groq client is unavailable")
    response = client.chat.completions.create(
        model=MODEL_ID,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=max_tokens,
        response_format={"type": "json_object"},
    )
    return response.choices[0].message.content.strip()


def _sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[.!?])\s+|\n+", text.strip())
    return [part.strip() for part in parts if part and part.strip()]


def _words(text: str) -> list[str]:
    return re.findall(r"[A-Za-z][A-Za-z'-]{2,}", text.lower())


def _keyword_counts(text: str) -> Counter:
    return Counter(word for word in _words(text) if word not in STOPWORDS)


def _top_sentences(text: str, limit: int) -> list[str]:
    sentences = _sentences(text)
    if not sentences:
        return []

    counts = _keyword_counts(text)
    scored: list[tuple[int, int, str]] = []
    for idx, sentence in enumerate(sentences):
        score = sum(counts.get(word, 0) for word in _words(sentence))
        scored.append((score, idx, sentence))

    top = sorted(scored, key=lambda item: (-item[0], item[1]))[:limit]
    return [item[2] for item in top]


def _difficulty(text: str) -> str:
    words = text.split()
    sentences = _sentences(text)
    if not words:
        return "Beginner"

    avg_sentence = len(words) / max(len(sentences), 1)
    if avg_sentence < 14:
        return "Beginner"
    if avg_sentence < 22:
        return "Intermediate"
    if avg_sentence < 30:
        return "Advanced"
    return "Expert"


def _complexity(text: str) -> str:
    tokens = _words(text)
    unique_ratio = len(set(tokens)) / max(len(tokens), 1)
    if unique_ratio < 0.25:
        return "Low"
    if unique_ratio < 0.4:
        return "Medium"
    if unique_ratio < 0.55:
        return "High"
    return "Very High"


def _category(keywords: list[str]) -> str:
    joined = " ".join(keywords)
    if any(word in joined for word in ["finance", "market", "investment", "revenue"]):
        return "Finance"
    if any(word in joined for word in ["health", "medical", "patient", "clinical"]):
        return "Healthcare"
    if any(word in joined for word in ["software", "technology", "digital", "data", "ai"]):
        return "Technology"
    if any(word in joined for word in ["school", "student", "learning", "education"]):
        return "Education"
    if any(word in joined for word in ["policy", "government", "public", "city"]):
        return "Public Affairs"
    return "General"


def _sentiment_data(text: str) -> dict:
    words = _words(text)
    pos = sum(1 for word in words if word in POSITIVE_WORDS)
    neg = sum(1 for word in words if word in NEGATIVE_WORDS)
    total = max(pos + neg, 1)

    if pos == 0 and neg == 0:
        positive = 25
        negative = 10
        neutral = 65
    else:
        positive = int(round((pos / total) * 100))
        negative = int(round((neg / total) * 100))
        neutral = max(0, 100 - positive - negative)

    if positive > negative + 10:
        sentiment = "Positive"
    elif negative > positive + 10:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"

    confidence_score = min(95, 45 + abs(positive - negative))
    confidence = "High" if confidence_score >= 75 else "Medium" if confidence_score >= 55 else "Low"
    overall_tone = "Analytical" if len(_sentences(text)) > 4 else "Informative"

    return {
        "overall_tone": overall_tone,
        "sentiment": sentiment,
        "formality": "Formal",
        "confidence": confidence,
        "confidence_score": confidence_score,
        "sentiment_scores": {
            "positive": positive,
            "negative": negative,
            "neutral": neutral,
        },
    }


def _fallback_summary(text: str, length: str = "detailed", tone: str = "professional") -> dict:
    cleaned_text = " ".join(text.strip().split())
    if not cleaned_text:
        raise ValueError("Input text is empty.")

    summary_sentences = _top_sentences(cleaned_text, 2 if length == "concise" else 4)
    concise_sentences = _top_sentences(cleaned_text, 1 if length == "concise" else 2)
    keywords = [word.title() for word, _ in _keyword_counts(cleaned_text).most_common(8)]
    key_points = _top_sentences(cleaned_text, 4 if length == "concise" else 6)
    insights = _top_sentences(cleaned_text, 3 if length == "concise" else 5)
    difficulty = _difficulty(cleaned_text)
    complexity = _complexity(cleaned_text)
    tone_analysis = _sentiment_data(cleaned_text)
    category = _category([kw.lower() for kw in keywords])

    writing_style = "Conversational" if tone == "casual" else "Analytical"
    audience = "General readers" if tone == "casual" else "Professionals and decision-makers"
    detected_topic = keywords[0] if keywords else "General Topic"

    return {
        "summary_concise": " ".join(concise_sentences) or cleaned_text[:180],
        "summary_detailed": " ".join(summary_sentences) or cleaned_text[:500],
        "key_points": key_points,
        "important_insights": insights,
        "keywords": keywords,
        "metadata_insights": {
            "detected_topic": detected_topic,
            "reading_difficulty": difficulty,
            "content_complexity": complexity,
            "estimated_audience": audience,
            "category": category,
            "writing_style": writing_style,
        },
        "tone_analysis": tone_analysis,
    }


def generate_summary(text: str, length: str = "detailed", tone: str = "professional") -> dict:
    text = text.strip()
    if not text:
        raise ValueError("Input text is empty.")

    client = get_client()
    if client is None:
        return _fallback_summary(text, length, tone)

    try:
        words = text.split()
        if len(words) <= MAX_CONTEXT_WORDS:
            raw = _call_groq(_build_prompt(text, tone))
        else:
            chunks = _chunk_text(text, max_words=MAX_CONTEXT_WORDS)
            chunk_texts = []
            for index, chunk in enumerate(chunks, start=1):
                print(f"   [Groq] Pre-summarizing chunk {index}/{len(chunks)}...")
                mini_prompt = f"Summarize the following text in a few sentences:\n\"\"\"\n{chunk}\n\"\"\""
                response = client.chat.completions.create(
                    model=MODEL_ID,
                    messages=[{"role": "user", "content": mini_prompt}],
                    temperature=0.3,
                    max_tokens=400,
                )
                chunk_texts.append(response.choices[0].message.content.strip())
            raw = _call_groq(_build_prompt("\n\n".join(chunk_texts), tone))
        return json.loads(raw)
    except Exception:
        return _fallback_summary(text, length, tone)


def _fallback_chat_reply(context_text: str, messages: list[dict]) -> str:
    user_messages = [message.get("content", "") for message in messages if message.get("role") == "user"]
    latest = user_messages[-1].strip() if user_messages else ""

    if not context_text.strip():
        return "I do not have document context yet. Please analyze some content first."
    if not latest:
        return "Ask a question about the analyzed content and I will answer from the document context."

    query_words = [word for word in _words(latest) if word not in STOPWORDS]
    candidates = []
    for sentence in _sentences(context_text):
        score = sum(1 for word in query_words if word in sentence.lower())
        if score:
            candidates.append((score, sentence))

    if not candidates:
        fallback = _top_sentences(context_text, 2)
        if fallback:
            return "I could not find a direct sentence match, but these lines look most relevant: " + " ".join(fallback)
        return "I could not find a reliable answer in the provided document context."

    best = [sentence for _, sentence in sorted(candidates, key=lambda item: item[0], reverse=True)[:3]]
    return "Based on the document, here is the most relevant information: " + " ".join(best)


def chat_with_document(context_text: str, messages: list[dict]) -> str:
    client = get_client()
    if client is None:
        return _fallback_chat_reply(context_text, messages)

    system_prompt = f"""You are an expert AI assistant analyzing a document for the user.
Answer the user's questions based ONLY on the provided document context.
If the answer is not in the document, politely say so.

DOCUMENT CONTEXT:
\"\"\"
{context_text}
\"\"\"
"""
    api_messages = [{"role": "system", "content": system_prompt}]
    for message in messages:
        api_messages.append({"role": message["role"], "content": message["content"]})

    try:
        response = client.chat.completions.create(
            model=MODEL_ID,
            messages=api_messages,
            temperature=0.3,
            max_tokens=1024,
        )
        return response.choices[0].message.content.strip()
    except Exception:
        return _fallback_chat_reply(context_text, messages)
