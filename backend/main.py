"""ARIA Career Odyssey — FastAPI backend entrypoint."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.services import interviewer, repo_auditor, resume_rag, scam_detector

app = FastAPI(
    title="ARIA Career Odyssey API",
    version="1.0.0",
    description="AI-powered career acceleration platform",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(interviewer.router)
app.include_router(repo_auditor.router)
app.include_router(resume_rag.router)
app.include_router(scam_detector.router)


@app.get("/health")
def health():
    return {"status": "ARIA online"}
