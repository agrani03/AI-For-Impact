import json
from io import BytesIO
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import List

# PDF parsing
from pypdf import PdfReader
# Image parsing
import pytesseract
from PIL import Image

# Core
from backend.core.config import MOCK_MODE, SUPABASE_URL, SUPABASE_SERVICE_KEY
from backend.core.nova import invoke_nova

router = APIRouter(prefix="/resume", tags=["resume"])

_model = None


def get_embedding_model():
    from sentence_transformers import SentenceTransformer

    global _model
    if _model is None:
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

class ResumeReport(BaseModel):
    match_score: int
    matched_skills: List[str]
    missing_skills: List[str]
    ats_compatibility: int
    top_job_recommendations: List[str]
    improvement_suggestions: List[str]

@router.post("/analyze", response_model=ResumeReport)
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form(default="")
):
    if MOCK_MODE:
        return ResumeReport(
            match_score=87,
            matched_skills=["React", "TypeScript", "Node.js", "AWS"],
            missing_skills=["GraphQL", "Docker", "Redis"],
            ats_compatibility=91,
            top_job_recommendations=["Senior Frontend Engineer", "Full Stack Developer", "React Native Developer"],
            improvement_suggestions=[
                "Add GraphQL to skills section",
                "Quantify impact metrics",
                "Add GitHub links to projects"
            ]
        )

    content = await file.read()
    resume_text = ""
    
    # 1 & 2. Extract text
    content_type = file.content_type
    filename = file.filename or ""
    
    try:
        if content_type == "application/pdf" or filename.lower().endswith(".pdf"):
            reader = PdfReader(BytesIO(content))
            resume_text = "\n".join(page.extract_text() for page in reader.pages if page.extract_text())
        elif (content_type and content_type.startswith("image/")) or filename.lower().endswith((".jpg", ".jpeg", ".png")):
            img = Image.open(BytesIO(content))
            resume_text = pytesseract.image_to_string(img)
        else:
            raise ValueError("Unsupported file type")
    except Exception as e:
        raise HTTPException(status_code=422, detail="Could not extract text from file")
        
    if not resume_text.strip():
        raise HTTPException(status_code=422, detail="Could not extract text from file")

    # 3. Limit to first 3000 chars
    resume_text = resume_text[:3000]
    
    # 4. Generate embedding
    embedding = get_embedding_model().encode(resume_text).tolist()
    
    # 5. Query Supabase pgvector
    try:
        from supabase import create_client

        supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        
        # In a real environment, you might use an RPC call for vector similarity search
        # like: supabase_client.rpc('match_market_knowledge', {'query_embedding': embedding, ...})
        # If raw SQL is needed, some clients allow it via the postgREST API using standard methods
        # However, the standard pgvector approach with supabase-py is to use RPC:
        response = supabase_client.rpc('match_market_knowledge', {
            'query_embedding': embedding,
            'match_threshold': 0.0,
            'match_count': 5
        }).execute()
        
        results = response.data if response.data else []
    except Exception as e:
        print(f"Supabase query failed: {e}")
        results = []
        
    rag_context = "\n---\n".join([row["content"] for row in results])
    
    # 6. Build prompt
    system_prompt = (
        "You are a senior tech recruiter and career coach. Analyze the candidate resume against "
        "the target job description and market context. Return ONLY valid JSON, no markdown, no backticks: "
        '{"match_score": 0-100, "matched_skills": list[str], "missing_skills": list[str], '
        '"ats_compatibility": 0-100, "top_job_recommendations": list[str] (exactly 3 job titles), '
        '"improvement_suggestions": list[str] (max 5)}'
    )
    
    user_message = f"Resume:\n{resume_text}\n\nTarget JD:\n{job_description}\n\nMarket context:\n{rag_context}"
    
    # 7. Call invoke_nova
    try:
        nova_response = invoke_nova(system_prompt, user_message)
        # Parse JSON safely, removing possible backticks if the model still adds them
        nova_response = nova_response.strip()
        if nova_response.startswith("```json"):
            nova_response = nova_response[7:]
        if nova_response.startswith("```"):
            nova_response = nova_response[3:]
        if nova_response.endswith("```"):
            nova_response = nova_response[:-3]
            
        parsed = json.loads(nova_response)
        
        # 8. Return ResumeReport
        return ResumeReport(**parsed)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process analysis results: {str(e)}")
