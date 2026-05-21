import pdfplumber
import docx
import requests
import io
import math
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup
from fastapi import UploadFile

async def extract_text_from_file(file: UploadFile) -> str:
    content = await file.read()
    
    if file.filename.endswith(".pdf"):
        text = ""
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text
        
    elif file.filename.endswith(".docx"):
        doc = docx.Document(io.BytesIO(content))
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text
        
    else:
        # Assuming plain text if not pdf or docx
        return content.decode("utf-8")

def extract_text_from_url(url: str) -> str:
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        
        # Remove script and style elements
        for script in soup(["script", "style", "header", "footer", "nav"]):
            script.extract()
            
        text = soup.get_text(separator="\n")
        # Clean up empty lines
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = "\n".join(chunk for chunk in chunks if chunk)
        
        return text
    except Exception as e:
        raise ValueError(f"Failed to fetch or parse URL: {str(e)}")

def get_url_metadata(url: str) -> dict:
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        # 1. Title
        title_tag = soup.find("meta", property="og:title")
        title = title_tag["content"] if title_tag and title_tag.get("content") else (soup.title.string if soup.title else "")

        # 2. Image
        image_tag = soup.find("meta", property="og:image")
        image = image_tag["content"] if image_tag and image_tag.get("content") else None

        # 3. Favicon
        icon_tag = soup.find("link", rel=lambda r: r and "icon" in r.lower())
        favicon = icon_tag["href"] if icon_tag and icon_tag.get("href") else "/favicon.ico"
        favicon = urljoin(url, favicon)

        # 4. Domain
        domain = urlparse(url).netloc.replace("www.", "")

        # 5. Reading Time
        # Extract plain text quickly
        for script in soup(["script", "style", "header", "footer", "nav"]):
            script.extract()
        text = soup.get_text(separator=" ")
        word_count = len(text.split())
        reading_time_minutes = max(1, math.ceil(word_count / 225)) # Avg 225 wpm

        return {
            "title": title.strip()[:100] if title else "Unknown Title",
            "domain": domain,
            "image": image,
            "favicon": favicon,
            "reading_time": reading_time_minutes
        }
    except Exception as e:
        return {"error": str(e)}
