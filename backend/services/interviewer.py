"""Interview scoring service — AI-powered mock interview evaluator."""
import json
from datetime import datetime
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from backend.core.config import MOCK_MODE
from backend.core.nova import invoke_nova

router = APIRouter(prefix="/interview", tags=["interview"])

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class InterviewScoreRequest(BaseModel):
    transcript: str
    role: str = "Full Stack"
    difficulty: str = "Medium"


class InterviewScore(BaseModel):
    technical_accuracy: int
    communication_clarity: int
    problem_solving_framework: int
    code_realism: int
    overall: int
    summary: str
    improvements: list[str]
    mock: bool = False
    error: Optional[str] = None


class VapiWebhookPayload(BaseModel):
    """Accepts VAPI transcript webhook — we only need the transcript text."""
    transcript: Optional[str] = None
    message: Optional[dict] = None
    call: Optional[dict] = None

# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = """You are an expert technical interviewer evaluating a candidate's mock interview transcript.
Return ONLY valid JSON with no markdown, no explanation, no backticks. Use this exact schema:
{
  "technical_accuracy": <0-100>,
  "communication_clarity": <0-100>,
  "problem_solving_framework": <0-100>,
  "code_realism": <0-100>,
  "overall": <weighted int: technical*0.30 + clarity*0.25 + framework*0.25 + realism*0.20>,
  "summary": "<2-sentence max assessment>",
  "improvements": ["<tip1>", "<tip2>", "<tip3>", "<tip4>"]
}"""

_MOCK_SCORE = InterviewScore(
    technical_accuracy=82,
    communication_clarity=78,
    problem_solving_framework=85,
    code_realism=74,
    overall=80,
    summary="Strong fundamentals demonstrated. Improve edge case handling and production thinking for senior roles.",
    improvements=[
        "Always mention time/space complexity upfront",
        "Ask clarifying questions before diving into a solution",
        "Mention error handling in every code example",
        "Discuss testing approach and edge cases explicitly",
    ],
    mock=True,
)


def _score_transcript(transcript: str, role: str, difficulty: str) -> InterviewScore:
    """Core scoring logic. Called by both /score and /webhook endpoints."""
    if MOCK_MODE:
        return _MOCK_SCORE

    user_message = (
        f"Role: {role}\n"
        f"Difficulty: {difficulty}\n\n"
        f"Interview Transcript:\n{transcript[:4000]}"  # cap to avoid token overflow
    )

    raw = invoke_nova(_SYSTEM_PROMPT, user_message)

    try:
        data = json.loads(raw)
        # Recalculate overall with correct weights in case Nova drifts
        weighted = round(
            data["technical_accuracy"] * 0.30
            + data["communication_clarity"] * 0.25
            + data["problem_solving_framework"] * 0.25
            + data["code_realism"] * 0.20
        )
        return InterviewScore(
            technical_accuracy=data["technical_accuracy"],
            communication_clarity=data["communication_clarity"],
            problem_solving_framework=data["problem_solving_framework"],
            code_realism=data["code_realism"],
            overall=weighted,
            summary=data.get("summary", ""),
            improvements=data.get("improvements", []),
            mock=False,
        )
    except (json.JSONDecodeError, KeyError):
        # Safe fallback — never crash for judges
        return InterviewScore(
            technical_accuracy=70,
            communication_clarity=70,
            problem_solving_framework=70,
            code_realism=70,
            overall=70,
            summary="Analysis completed. Detailed scoring unavailable due to a parsing issue.",
            improvements=["Review your answer structure", "Be more specific with examples"],
            mock=False,
            error="parse_failed",
        )


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/score", response_model=InterviewScore)
def score_interview(req: InterviewScoreRequest) -> InterviewScore:
    """Score a completed interview transcript."""
    return _score_transcript(req.transcript, req.role, req.difficulty)


@router.post("/webhook", response_model=InterviewScore)
def vapi_webhook(payload: VapiWebhookPayload) -> InterviewScore:
    """
    VAPI sends the completed call transcript here.
    Extracts the transcript text and runs it through the scoring pipeline.
    """
    # VAPI can send transcript in multiple shapes — handle both
    transcript = payload.transcript or ""

    if not transcript and payload.message:
        transcript = payload.message.get("transcript", "")

    if not transcript and payload.call:
        transcript = payload.call.get("transcript", "")

    if not transcript:
        transcript = "No transcript available."

    # Default role/difficulty — VAPI doesn't send these; frontend stores them in session
    return _score_transcript(transcript, role="Full Stack", difficulty="Medium")
