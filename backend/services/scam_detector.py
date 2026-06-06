"""Scam detector service — placeholder until Archanya builds it."""

from fastapi import APIRouter

router = APIRouter(prefix="/jobs", tags=["scam-detector"])


@router.get("/status")
def status():
    return {"status": "scam_detector placeholder — Archanya will build this"}
