from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional
import os
import json
import httpx
import re
from datetime import datetime
from io import BytesIO

# Try importing dependencies gracefully to support isolated testing
try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None

try:
    from PIL import Image
except ImportError:
    Image = None

try:
    import pytesseract
except ImportError:
    pytesseract = None

try:
    import cv2
    import numpy as np
except ImportError:
    cv2 = None
    np = None

import boto3
from dotenv import load_dotenv

# Load .env configurations from the root folder
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
env_path = os.path.join(project_root, ".env")
if load_dotenv:
    load_dotenv(dotenv_path=env_path)

MOCK_MODE = os.getenv("MOCK_MODE", "true").lower() == "true"
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
BEDROCK_MODEL_ID = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-pro-v1:0")

def invoke_nova(system_prompt: str, user_message: str) -> str:
    """Invoke AWS Bedrock Nova using credentials loaded from .env."""
    if MOCK_MODE:
        return '{"semantic_trust_score": 70, "risk_factors": ["Running with local AI fallback wrapper"], "verdict": "SAFE", "reasoning": "MOCK_MODE is true, using mock scan."}'
    
    if not AWS_ACCESS_KEY_ID or not AWS_SECRET_ACCESS_KEY:
        raise ValueError("AWS credentials are missing from the .env file.")

    # Connect to Bedrock runtime
    client = boto3.client(
        "bedrock-runtime",
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY
    )
    
    body = json.dumps({
        "system": [{"text": system_prompt}],
        "messages": [{"role": "user", "content": [{"text": user_message}]}],
        "inferenceConfig": {
            "maxTokens": 1000,
            "temperature": 0.7
        }
    })
    
    try:
        response = client.invoke_model(
            modelId=BEDROCK_MODEL_ID,
            body=body,
            accept="application/json",
            contentType="application/json"
        )
        result = json.loads(response["body"].read())
        return result["output"]["message"]["content"][0]["text"]
    except Exception as e:
        raise RuntimeError(f"Nova invocation failed: {str(e)}")

router = APIRouter(prefix="/jobs", tags=["jobs"])

class TrustReport(BaseModel):
    trust_score: int
    fake_job_score: int
    verdict: str
    risk_factors: List[str]
    heuristic_flags: List[str]
    reasoning: str
    analyzed_at: datetime
    suspicious_emails: List[str] = []
    extracted_qr_url: Optional[str] = None
    ocr_text_extracted: Optional[bool] = False

MOCK_REPORT = {
    "trust_score": 68,
    "fake_job_score": 32,
    "verdict": "SUSPICIOUS",
    "risk_factors": ["Salary range not specified", "Company LinkedIn has few followers"],
    "heuristic_flags": [],
    "reasoning": "Job posting appears mostly legitimate but lacks verifiable company details.",
    "analyzed_at": datetime.now(),
    "suspicious_emails": ["recruiter.jobsyee@gmail.com"],
    "extracted_qr_url": None,
    "ocr_text_extracted": False
}

RED_FLAGS = [
    "no interview required", "no experience needed", "earn $", "guaranteed income",
    "pay upfront", "purchase kit", "wire transfer", "western union", "advance payment",
    "@gmail.com", "@yahoo.com", "@hotmail.com", "work from home earn", "limited slots",
    "urgent hiring 500", "joining fee", "registration fee", "training fee", "send cv on whatsapp"
]

FREE_DOMAINS = [
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", 
    "aol.com", "zoho.com", "mail.com", "protonmail.com", 
    "yandex.com", "rediffmail.com", "gmx.com"
]

def extract_emails(text: str) -> List[str]:
    """Find all email addresses in the text using regex."""
    pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    return re.findall(pattern, text)

def check_suspicious_emails(emails: List[str]) -> List[str]:
    """Filter emails that use free public domains instead of custom corporate ones."""
    suspicious = []
    for email in emails:
        domain = email.split('@')[-1].lower()
        if domain in FREE_DOMAINS:
            suspicious.append(email)
    return suspicious

@router.post("/scan", response_model=TrustReport)
async def scan_job(
    file: Optional[UploadFile] = File(None),
    url: Optional[str] = Form(None),
    description: Optional[str] = Form(None)
):
    if MOCK_MODE:
        mock_data = MOCK_REPORT.copy()
        mock_data["analyzed_at"] = datetime.now()
        input_text = (description or url or "").lower()
        detected_flags = [flag for flag in RED_FLAGS if flag in input_text]
        detected_emails = extract_emails(description or url or "")
        suspicious_emails = check_suspicious_emails(detected_emails)
        if detected_flags or suspicious_emails:
            risk = min(90, 35 + len(detected_flags) * 12 + (20 if suspicious_emails else 0))
            mock_data["fake_job_score"] = risk
            mock_data["trust_score"] = 100 - risk
            mock_data["verdict"] = "SCAM" if risk >= 70 else "SUSPICIOUS"
            mock_data["heuristic_flags"] = detected_flags
            mock_data["suspicious_emails"] = suspicious_emails
            mock_data["risk_factors"] = list(set(detected_flags + (["Recruiter is using free email provider"] if suspicious_emails else [])))
            mock_data["reasoning"] = "Demo scan found common fraud indicators in the posting text."
        # If user uploaded a mock file, simulate QR scan
        if file:
            mock_data["ocr_text_extracted"] = True
            mock_data["extracted_qr_url"] = "https://mock-scam-jobs.in/apply"
            mock_data["verdict"] = "SCAM"
            mock_data["fake_job_score"] = 85
            mock_data["trust_score"] = 15
            mock_data["risk_factors"] = ["QR redirect to unverified domain", "Upfront payment mentioned in flyer text"]
        return TrustReport(**mock_data)

    text = ""
    extracted_qr_url = None
    ocr_text_extracted = False

    # 1. Handle file upload (Job flyer image or QR code)
    if file:
        try:
            content = await file.read()
            
            # A. Attempt QR code extraction using OpenCV
            if cv2 is not None and np is not None:
                nparr = np.frombuffer(content, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                if img is not None:
                    detector = cv2.QRCodeDetector()
                    qr_data, bbox, _ = detector.detectAndDecode(img)
                    if qr_data:
                        extracted_qr_url = qr_data
                        # If the QR code redirects to a URL, we attempt to scan it
                        url = qr_data
            
            # B. Attempt OCR Text Extraction using PyTesseract
            if Image is not None and pytesseract is not None:
                img = Image.open(BytesIO(content))
                extracted = pytesseract.image_to_string(img)
                if extracted.strip():
                    text = extracted.strip()
                    ocr_text_extracted = True
        except Exception as e:
            # Suppress errors for clean flow, but keep log
            print(f"Error processing uploaded image file: {str(e)}")

    # 2. Scrape URL if provided (or extracted from QR)
    if url:
        try:
            async with httpx.AsyncClient() as client:
                res = await client.get(url, timeout=10, headers={"User-Agent": "ARIA-ScamDetector"})
                if res.status_code == 200:
                    if BeautifulSoup:
                        soup = BeautifulSoup(res.text, "html.parser")
                        for element in soup(["script", "style"]):
                            element.decompose()
                        scrape_text = soup.get_text(separator=" ").strip()
                        if scrape_text:
                            # Combine OCR text and webpage text if both exist
                            text = (text + "\n" + scrape_text).strip()
                    else:
                        text = (text + "\n" + res.text).strip()
        except Exception:
            pass

    # 3. Fall back to description if needed
    if not text.strip():
        if description and description.strip():
            text = description.strip()
        else:
            raise HTTPException(
                status_code=400, 
                detail="Please provide a valid URL, job description text, or upload a flyer image/QR code."
              )

    # 4. Check for emails and suspicious domains
    emails = extract_emails(text)
    suspicious_emails = check_suspicious_emails(emails)

    # 5. Heuristic red-flags check
    heuristic_flags = [flag for flag in RED_FLAGS if flag in text.lower()]
    
    # Calculate base risk
    base_risk_score = len(heuristic_flags) * 20
    if suspicious_emails:
        # Penalty for using free recruiter email domains
        base_risk_score += 15
    base_risk_score = min(100, base_risk_score)

    # If heuristic risk is extremely high, bypass Nova to save tokens
    if base_risk_score >= 80:
        risk_list = list(set(heuristic_flags))
        if suspicious_emails:
            risk_list.append("Recruiter is using free email provider")
        if extracted_qr_url:
            risk_list.append("Image contains redirect link")
            
        return TrustReport(
            trust_score=10,
            fake_job_score=90,
            verdict="SCAM",
            risk_factors=risk_list,
            heuristic_flags=heuristic_flags,
            reasoning="Multiple critical scam indicators (such as free email recruiters or upfront fee requests) were auto-flagged.",
            analyzed_at=datetime.now(),
            suspicious_emails=suspicious_emails,
            extracted_qr_url=extracted_qr_url,
            ocr_text_extracted=ocr_text_extracted
        )

    # 6. Call Bedrock Nova
    system_prompt = (
        "You are a job fraud analyst for an Indian job market. Analyze the job posting text.\n"
        "Return ONLY valid JSON, with no markdown, backticks, or extra explanation.\n"
        "{\n"
        "  \"semantic_trust_score\": int (0-100),\n"
        "  \"risk_factors\": list[str] (max 6),\n"
        "  \"verdict\": \"SAFE\" | \"SUSPICIOUS\" | \"SCAM\",\n"
        "  \"reasoning\": \"2 sentences max explanation\"\n"
        "}"
    )

    user_message = f"Job Posting Text (truncated):\n{text[:2000]}"
    if suspicious_emails:
        user_message += f"\nDetected Recruiter Emails: {', '.join(suspicious_emails)}"
    if extracted_qr_url:
        user_message += f"\nExtracted QR code link: {extracted_qr_url}"

    try:
        response_text = invoke_nova(system_prompt, user_message)
        
        # Clean response
        clean_text = response_text.strip()
        if clean_text.startswith("```"):
            lines = clean_text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            clean_text = "\n".join(lines).strip()

        parsed = json.loads(clean_text)
        nova_score = int(parsed.get("semantic_trust_score", 70))
        risk_factors = parsed.get("risk_factors", [])
        verdict = parsed.get("verdict", "SUSPICIOUS")
        reasoning = parsed.get("reasoning", "Semantic scan completed.")
    except Exception as e:
        nova_score = 100 - base_risk_score
        risk_factors = heuristic_flags if heuristic_flags else ["Failed to perform semantic analysis"]
        verdict = "SUSPICIOUS" if base_risk_score > 0 else "SAFE"
        reasoning = f"Heuristic analysis completed, AI evaluation failed. Details: {str(e)}"

    # 7. Final calculations
    final_trust = round((nova_score * 0.7) + ((100 - base_risk_score) * 0.3))
    
    # Penalize trust score further if free domains are found
    if suspicious_emails:
        final_trust = max(10, final_trust - 10)
        
    final_fake = 100 - final_trust

    # Align verdict
    if final_trust > 70:
        verdict = "SAFE"
    elif final_trust > 40:
        verdict = "SUSPICIOUS"
    else:
        verdict = "SCAM"

    # Merge risk factors
    combined_risks = list(set(risk_factors + heuristic_flags))
    if suspicious_emails and "Free recruiter email" not in combined_risks:
        combined_risks.append("Recruiter is using free email provider")
    if extracted_qr_url and "QR redirect check" not in combined_risks:
        combined_risks.append("Image contains redirect link")

    return TrustReport(
        trust_score=final_trust,
        fake_job_score=final_fake,
        verdict=verdict,
        risk_factors=combined_risks,
        heuristic_flags=heuristic_flags,
        reasoning=reasoning,
        analyzed_at=datetime.now(),
        suspicious_emails=suspicious_emails,
        extracted_qr_url=extracted_qr_url,
        ocr_text_extracted=ocr_text_extracted
    )
