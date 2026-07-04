import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables (fallback if not loaded by pydantic)
load_dotenv()

from app.api.endpoints import pr

app = FastAPI(
    title="Reviewly Backend API",
    description="Backend service for code diff parsing, screenshot auditing, and Slack review alerts.",
    version="1.0.0"
)

# CORS configuration to allow local & hosted React frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to allowed domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(pr.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Reviewly API is running successfully.",
        "platform": "Hugging Face Spaces"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
