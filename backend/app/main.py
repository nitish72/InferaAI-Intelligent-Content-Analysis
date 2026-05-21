from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.api.auth import router as auth_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("ðŸš€ Infera AI API started")
    yield
    print("ðŸ›‘ Infera AI API shutting down")

app = FastAPI(
    title="Infera AI API",
    description="Intelligent Content Analysis & Summarization Platform powered by Groq",
    version="3.0.0",
    lifespan=lifespan,
)

# CORS â€” allow React dev server on any local development port
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_origin_regex=r"http://localhost:\d+|http://127\.0\.0\.1:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(router, prefix="/api")


@app.get("/")
def health_check():
    return {"status": "ok", "model": "llama3-70b-8192", "provider": "Groq", "app": "Infera AI"}
