import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Infera AI API"
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "infera_ai")
    MODEL_NAME: str = "llama3-70b-8192"

settings = Settings()
