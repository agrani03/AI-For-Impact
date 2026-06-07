"""ARIA Career Odyssey — FastAPI backend entrypoint."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.services import interviewer, repo_auditor, resume_rag, scam_detector, code_executor

import os

app = FastAPI(
    title="ARIA Career Odyssey API",
    version="1.0.0",
    description="AI-powered career acceleration platform",
)

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(interviewer.router)
app.include_router(repo_auditor.router)
app.include_router(resume_rag.router)
app.include_router(scam_detector.router)
app.include_router(code_executor.router)


@app.get("/health")
def health():
    return {"status": "ARIA online"}
