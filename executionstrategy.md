# ARIA: Career Odyssey — Execution Strategy

**7-Hour Hackathon Playbook | June 6, 2026**
**Team: Kush · Somya · Archanya · Agrani**

---

## 0. The Real Talk Before We Start

This is a 7-hour sprint. The enemy is not complexity — it's coordination failure. Every minute someone spends waiting for a credential, a merge conflict, or an undefined API response is a minute wasted. This document is designed so each person can work in complete isolation until the integration hour (3:30). Read your own section, follow the commit sequence, and don't block others.

**The single most important rule: Somya finishes AWS + shares .env by 0:25. Everyone else uses `MOCK_MODE=true` until then.**

---

## Part 1: Master Timeline

| Hour | Kush | Somya | Archanya | Agrani |
|------|------|-------|----------|--------|
| **0:00–0:25** | Git repo init, scaffold folders | **AWS CLI setup + IAM + Bedrock + S3 + Supabase → share .env** | Git clone, scaffold | Git clone, Next.js init |
| **0:25–1:30** | nova.py + main.py + interviewer.py (MOCK_MODE) | repo_auditor.py skeleton (MOCK_MODE) | scam_detector.py skeleton (MOCK_MODE) | Landing page + login page |
| **1:30–2:30** | Wire real Nova into interviewer.py | Wire real Nova + GitHub API into repo_auditor.py | Wire real Nova + httpx into scam_detector.py | Dashboard layout + sidebar + 4 stub cards |
| **2:30–3:30** | VAPI client integration + interview page UI | repo auditor frontend page | scam detector frontend page | Resume RAG service + seed script |
| **3:30–4:30** | Test interview end-to-end, fix bugs | Test repo audit end-to-end, fix bugs | Test scam detector end-to-end, fix bugs | Wire all 4 API endpoints into dashboard cards |
| **4:30–5:00** | Post-call score UI polish | repo results UI polish | scam results UI polish | Loading states, error states, Vercel deploy |
| **5:00–5:30** | Full end-to-end smoke test across all features | Write repo_standards.md knowledge base | Write knowledge base + help Kush test | Final deploy verify + responsive check |
| **5:30–6:00** | Record demo video (3 min) | Architecture diagram PNG | Help with diagram | README + AI usage note |
| **6:00–6:30** | Review README, submit | Push final commits | Push final commits | Submission package complete |
| **6:30–7:00** | Buffer / polish / fix last-minute issues | — | — | Submit GitHub link |

### Shared Checkpoints (everyone must hit these)

- **0:25** — Somya shares .env in WhatsApp. Everyone else unblocked.
- **1:30** — Everyone has a working mock endpoint. Agrani can call them.
- **3:30** — Everyone has a working real endpoint. Integration starts.
- **5:00** — All 4 features demo-able end-to-end. Stop adding features.
- **5:30** — Code freeze. Only bug fixes allowed after this.

---

## Part 2: Git Repository Setup (Kush does this at 0:00)

```bash
# Kush runs this immediately at start
mkdir aria-career-odyssey && cd aria-career-odyssey
git init
git remote add origin https://github.com/[your-team-org]/aria-career-odyssey

# Create the full folder structure in one shot
mkdir -p frontend/src/{app/{login,dashboard,interview,repo,resume,jobs},components,lib}
mkdir -p backend/{core,services,knowledge,scripts}

# Create placeholder files so git tracks the structure
touch backend/core/{config.py,nova.py}
touch backend/services/{interviewer.py,repo_auditor.py,resume_rag.py,scam_detector.py}
touch backend/knowledge/{repo_standards.md,market_skills.md}
touch backend/{main.py,requirements.txt}
touch .env.example README.md

git add .
git commit -m "chore: initial project scaffold — aria-career-odyssey"
git push -u origin main

# Add all teammates as collaborators on GitHub immediately
```

### Repo Structure

```
aria-career-odyssey/
├── frontend/                         ← AGRANI owns this
│   └── src/
│       ├── app/
│       │   ├── page.tsx              (Landing)
│       │   ├── login/page.tsx
│       │   ├── dashboard/page.tsx
│       │   ├── interview/page.tsx    ← KUSH owns this page
│       │   ├── repo/page.tsx         ← SOMYA owns this page
│       │   ├── resume/page.tsx       ← AGRANI owns this page
│       │   └── jobs/page.tsx         ← ARCHANYA owns this page
│       ├── components/
│       │   ├── ScoreRing.tsx         (shared SVG donut)
│       │   └── SkillBadge.tsx        (shared pill badge)
│       └── lib/
│           └── supabase.ts
├── backend/
│   ├── main.py                       (Kush sets this up)
│   ├── core/
│   │   ├── config.py                 (Kush sets this up)
│   │   └── nova.py                   (Kush sets this up — EVERYONE uses this)
│   ├── services/
│   │   ├── interviewer.py            ← KUSH
│   │   ├── repo_auditor.py           ← SOMYA
│   │   ├── resume_rag.py             ← AGRANI
│   │   └── scam_detector.py          ← ARCHANYA
│   ├── knowledge/
│   │   ├── repo_standards.md         ← SOMYA
│   │   └── market_skills.md          ← AGRANI
│   ├── scripts/
│   │   └── seed_knowledge.py         ← AGRANI
│   └── requirements.txt
├── .env.example
└── README.md
```

---

## Part 3: Somya — AWS CLI Setup + IAM + All Infrastructure

**This is the most critical task. Target completion: 0:25. Everyone waits for you.**

### Step 1: Install AWS CLI (if not already)

```bash
# Mac
brew install awscli

# Linux/WSL
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip && sudo ./aws/install

# Verify
aws --version
```

### Step 2: Create IAM User via AWS Console (one-time, then CLI takes over)

1. Go to [console.aws.amazon.com](https://console.aws.amazon.com) → IAM → Users → **Create User**
2. Username: `aria-hackathon-agent`
3. **Do NOT check "Enable console access"** — this is a programmatic-only user
4. Permissions → Attach policies directly → select these:
   - `AmazonBedrockFullAccess`
   - `AmazonS3FullAccess`
5. Click through → **Create User**
6. Click the user → **Security credentials** tab → **Create access key**
7. Use case: **Command Line Interface (CLI)**
8. Download the CSV — this has `Access key ID` and `Secret access key`

### Step 3: Configure AWS CLI with the New Key

```bash
aws configure --profile aria

# It will prompt:
# AWS Access Key ID: [paste from CSV]
# AWS Secret Access Key: [paste from CSV]
# Default region name: us-east-1
# Default output format: json
```

This creates a named profile `aria`. Now every `aws` command your agent runs uses `--profile aria` or you set `AWS_PROFILE=aria` in .env. The key is stored in `~/.aws/credentials` — your agents pick it up automatically via boto3.

**Verify it works:**

```bash
aws sts get-caller-identity --profile aria
# Should return: Account ID, UserId, ARN for aria-hackathon-agent
```

### Step 4: Enable Bedrock Model Access

```bash
# Check what models are available in your region
aws bedrock list-foundation-models --region us-east-1 --profile aria \
  --query "modelSummaries[?contains(modelId,'nova')].[modelId,modelName]" \
  --output table

# Request access to Nova Pro (if not already enabled)
# This CANNOT be done via CLI — go to:
# AWS Console → Bedrock → Model Access → Find "Amazon Nova Pro" → Request Access
# Takes ~2 minutes. Come back and verify:
aws bedrock get-foundation-model \
  --model-identifier amazon.nova-pro-v1:0 \
  --region us-east-1 \
  --profile aria
```

**Test a real Nova call from CLI (do this before sharing creds):**

```bash
aws bedrock-runtime invoke-model \
  --model-id amazon.nova-pro-v1:0 \
  --region us-east-1 \
  --profile aria \
  --body '{"messages":[{"role":"user","content":[{"type":"text","text":"Reply only: ARIA online"}]}],"max_tokens":20,"anthropic_version":"bedrock-2023-05-31"}' \
  --cli-binary-format raw-in-base64-out \
  /tmp/nova_test.json && cat /tmp/nova_test.json
# If you see a response → Nova is working. Share creds.
```

### Step 5: Create S3 Bucket via CLI

```bash
# Create bucket
aws s3api create-bucket \
  --bucket aria-resumes-2026 \
  --region us-east-1 \
  --profile aria

# Disable block public access (hackathon only — for simplicity)
aws s3api delete-public-access-block \
  --bucket aria-resumes-2026 \
  --profile aria

# Verify
aws s3 ls --profile aria
```

### Step 6: Supabase Setup

1. Go to [supabase.com](https://supabase.com) → New Project → name: `aria-career-odyssey`
2. Wait ~2 min for provisioning
3. SQL Editor → run this exact SQL:

```sql
-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Resume RAG knowledge base
CREATE TABLE market_knowledge (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding VECTOR(384),
  category TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON market_knowledge USING ivfflat (embedding vector_cosine_ops);

-- User profiles (extends Supabase auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  github_username TEXT,
  plan TEXT DEFAULT 'free',
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scan history for dashboard "last scanned" info
CREATE TABLE scan_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scan_type TEXT CHECK (scan_type IN ('interview','repo','resume','job')),
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
```

4. Settings → API → copy `URL`, `anon key`, `service_role key`
5. Authentication → Providers → Enable **Google** and **GitHub** OAuth
   - For Google: create OAuth app at console.cloud.google.com → copy client ID + secret
   - For GitHub: Settings → Developer Settings → OAuth Apps → new app → callback URL: `https://[your-project].supabase.co/auth/v1/callback`

### Step 7: Build the .env and Share to Team WhatsApp

```bash
# Fill this out completely, then share to group
cat > .env.example << 'EOF'
# AWS — from IAM CSV download
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_PROFILE=aria

# Bedrock
BEDROCK_MODEL_ID=amazon.nova-pro-v1:0

# S3
S3_BUCKET_NAME=aria-resumes-2026

# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...

# Frontend (Next.js needs NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=http://localhost:8000

# VAPI (get from dashboard.vapi.ai)
VAPI_API_KEY=...
NEXT_PUBLIC_VAPI_PUBLIC_KEY=...

# Dev flags
MOCK_MODE=false
EOF
```

**Share the filled `.env` (not `.env.example`) directly to the WhatsApp group. Pin it.**

### Step 8: How Agents Auto-Use AWS (The Key Point)

When you run `aws configure --profile aria`, boto3 in Python automatically discovers credentials in this order:
1. Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) — used when `.env` is loaded
2. `~/.aws/credentials` profile — used on your local machine

**This means:** once each teammate copies the `.env` values and runs `pip install boto3 python-dotenv`, their agents can call Nova with zero extra setup. boto3 picks up the env vars automatically. No hardcoded keys, no manual credential passing.

```python
# This is all the agent needs — boto3 auto-reads from .env vars
import boto3
client = boto3.client("bedrock-runtime", region_name=os.getenv("AWS_REGION"))
# ← credentials come from AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY in environment
```

### Somya's Feature: repo_auditor.py

After infra (target: done by 0:50), build your feature. Agent prompt:

```
You are a backend engineer building for ARIA: Career Odyssey hackathon (FastAPI, Python 3.11).

CONTEXT: The shared nova.py helper already exists at backend/core/nova.py with signature:
  invoke_nova(system_prompt: str, user_message: str) -> str
  Uses boto3 + env vars AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, BEDROCK_MODEL_ID
  Returns raw string (Nova's response). If MOCK_MODE=true, returns hardcoded mock.

BUILD: backend/services/repo_auditor.py

FastAPI router with prefix /repo.
Endpoint: POST /repo/audit
Request body (Pydantic): RepoAuditRequest { github_url: str }

WORKFLOW:
1. Parse owner and repo name from github_url using urllib.parse
2. Hit GitHub API (no auth needed for public repos):
   GET https://api.github.com/repos/{owner}/{repo}/git/trees/HEAD?recursive=1
   Headers: {"Accept": "application/vnd.github.v3+json", "User-Agent": "ARIA-Auditor"}
3. If 404 or repo is private (API returns "not found"):
   Return RepoAuditResponse with error="repo_private", craftsmanship_score=0,
   message="This repo is private or doesn't exist. Make it public on GitHub then retry."
4. From the tree, extract: full directory structure (all paths), detect tech stack from file extensions
   and filenames (package.json=Node, requirements.txt=Python, etc.)
5. Fetch content of up to 3 files in this priority order:
   main.py OR index.js OR App.tsx OR server.js → whichever exists first
   package.json OR requirements.txt → whichever exists
   README.md → if exists
   Use: GET https://api.github.com/repos/{owner}/{repo}/contents/{path}
   Decode base64 content. Truncate each file to first 150 lines to stay within token limits.
6. Build this exact system prompt string for Nova:
   "You are a senior software engineer doing a code review. Evaluate the provided repository data
   and return ONLY valid JSON with no markdown, no explanation, no backticks. JSON schema:
   {craftsmanship_score: 0-100, code_quality: 0-100, security: 0-100, maintainability: 0-100,
   best_practices: 0-100, test_coverage_inferred: 0-100, tech_stack: list[str],
   anti_patterns: list[str] (max 5), recommendations: list[str] (max 5),
   summary: str (2 sentences max)}"
7. User message = stringify the repo data (structure + file contents)
8. Call invoke_nova(system_prompt, user_message)
9. Parse JSON safely. If parse fails: return default mid-range scores with error note.
10. Return full RepoAuditResponse Pydantic model.

MOCK_MODE: if os.getenv("MOCK_MODE") == "true", skip all API calls and return:
{craftsmanship_score:84, code_quality:88, security:76, maintainability:82, best_practices:90,
test_coverage_inferred:60, tech_stack:["React","Node.js","MongoDB"], 
anti_patterns:["No error boundaries","Hardcoded config values"],
recommendations:["Add Jest tests","Use environment variables for all config"],
summary:"Solid project structure with good component organization. Security and test coverage need attention."}

Return the complete file, no placeholders.
```

**Commit sequence for Somya:**

```
~0:25  chore: AWS CLI configured, .env shared, Supabase SQL run
~0:50  chore: Bedrock Nova test passed, S3 bucket created
~1:00  feat: repo_auditor.py skeleton with mock mode working
~2:30  feat: GitHub API tree fetch + file content extraction
~3:00  feat: Nova scoring integrated, JSON parsing with fallback
~4:00  feat: repo audit frontend page wired to backend
~5:00  fix: private repo error handling + rate limit safety
~5:30  docs: architecture diagram added to README
```

---

## Part 4: Kush — nova.py + main.py + AI Voice Interviewer

You build first. nova.py and main.py are shared infrastructure — everyone needs them. Do these before your own feature.

### Agent Prompt (Claude Opus 4.6 — primary account)

```
You are a senior backend engineer. Build shared infrastructure + the interview module for ARIA: Career Odyssey.

IMPORTANT: Build in this exact order. Files 1 and 2 are shared by all teammates.

===FILE 1: backend/core/config.py===
from dotenv import load_dotenv
import os
load_dotenv()

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
BEDROCK_MODEL_ID = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-pro-v1:0")
S3_BUCKET = os.getenv("S3_BUCKET_NAME")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
MOCK_MODE = os.getenv("MOCK_MODE", "false").lower() == "true"

===FILE 2: backend/core/nova.py===
import boto3, json, os
from backend.core.config import AWS_REGION, BEDROCK_MODEL_ID, MOCK_MODE

def invoke_nova(system_prompt: str, user_message: str) -> str:
    """Shared Nova invocation. All services use this. Returns raw string response."""
    if MOCK_MODE:
        return '{"mock": true, "message": "MOCK_MODE is enabled. Set MOCK_MODE=false and add real AWS credentials."}'
    
    client = boto3.client(
        "bedrock-runtime",
        region_name=AWS_REGION,
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
    )
    
    body = json.dumps({
        "messages": [{"role": "user", "content": [{"type": "text", "text": user_message}]}],
        "system": [{"type": "text", "text": system_prompt}],
        "max_tokens": 1000,
        "anthropic_version": "bedrock-2023-05-31"
    })
    
    try:
        response = client.invoke_model(modelId=BEDROCK_MODEL_ID, body=body)
        result = json.loads(response["body"].read())
        return result["content"][0]["text"]
    except Exception as e:
        raise RuntimeError(f"Nova invocation failed: {str(e)}")

===FILE 3: backend/main.py===
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.services import interviewer, repo_auditor, resume_rag, scam_detector

app = FastAPI(title="ARIA Career Odyssey API", version="1.0.0")

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
def health(): return {"status": "ARIA online"}

===FILE 4: backend/requirements.txt===
fastapi==0.111.0
uvicorn==0.30.0
python-dotenv==1.0.1
boto3==1.34.0
pydantic==2.7.0
httpx==0.27.0
beautifulsoup4==4.12.3
pypdf==4.2.0
Pillow==10.3.0
pytesseract==0.3.10
sentence-transformers==3.0.0
supabase==2.5.0
python-multipart==0.0.9

===FILE 5: backend/services/interviewer.py===
Build this service:
- FastAPI router with prefix /interview
- POST /interview/score — body: { transcript: str, role: str, difficulty: str }
- System prompt forces Nova to return ONLY JSON (no markdown, no explanation):
  Schema: { technical_accuracy: 0-100, communication_clarity: 0-100, 
  problem_solving_framework: 0-100, code_realism: 0-100, overall: weighted_average_int,
  summary: str, improvements: list[str] (max 4) }
- Weights: technical×0.30 + clarity×0.25 + framework×0.25 + realism×0.20
- Use invoke_nova() from backend.core.nova
- Parse JSON safely — if JSON parse fails, return mock scores with error flag
- If MOCK_MODE: return { technical_accuracy:82, communication_clarity:78,
  problem_solving_framework:85, code_realism:74, overall:80,
  summary:"Strong fundamentals. Improve edge case handling and production thinking.",
  improvements:["Always mention time/space complexity","Ask clarifying questions first",
  "Mention error handling in code examples","Discuss testing approach"] }
- Return Pydantic InterviewScore model
- ALSO: POST /interview/webhook — accepts VAPI transcript webhook payload,
  extracts transcript text, calls /interview/score logic, returns same InterviewScore

===FILE 6: frontend/src/app/interview/page.tsx===
Build the interview page. Install first: npm install @vapi-ai/web

The page has 3 states managed by useState: 'idle' | 'active' | 'complete'

IDLE STATE:
- Role selector: ["Frontend Engineer","Backend Engineer","Full Stack","AIML Engineer","DevOps"]
- Difficulty selector: ["Easy","Medium","Hard"]
- Big "▶ Start Interview" button in accent purple

ACTIVE STATE:
- Large animated wave-orb: 3 concentric SVG circles, strokeDasharray animation in #560BAD
  pulsing at different speeds (1.2s, 1.8s, 2.4s)
- Center text: session timer counting up (useEffect + setInterval)
- Vapi.start() called on entering this state with:
  publicKey: process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY
  assistant config with serverUrl pointing to NEXT_PUBLIC_API_URL/interview/webhook
- After 30s (useEffect + setTimeout): show toast from bottom:
  "Tired of the orb? 👀" + "Summon ARIA →" button
- Clicking Summon: orb div fades out (CSS transition opacity 0 over 300ms)
  then shows img src="/aria.png" with className="animate-bounce w-64 h-64 mx-auto"
- "End Session" button calls Vapi.stop(), transitions to complete state

COMPLETE STATE:
- "Interview Complete! Here's your ARIA Analysis" heading
- Overall score large number (count-up animation from 0 to score.overall over 1500ms)
- 4 metric cards in 2×2 grid, each with count-up animation staggered by 200ms each
- Color: green bg if >80, yellow if 60-80, red if <60
- improvements[] list with bullet icons
- "Start New Session" button resets to idle

Return all 6 files complete with no placeholders.
```

**Commit sequence for Kush:**

```
~0:25  chore: git repo initialized + folder structure + added teammates
~0:45  feat: config.py + nova.py + main.py + requirements.txt
~1:30  feat: interviewer.py with mock mode + /health endpoint working
~2:30  feat: Nova real scoring integrated, VAPI webhook endpoint
~3:30  feat: interview page — idle + active states with wave orb
~4:30  feat: ARIA summon + complete state with animated score cards
~5:00  fix: VAPI connection edge cases + session cleanup
```

---

## Part 5: Archanya — Job Scam Detector

### Agent Prompt (Claude Sonnet 4.6)

```
You are a backend engineer building for ARIA: Career Odyssey hackathon (FastAPI, Python 3.11).

CONTEXT: Shared infrastructure already exists:
- backend/core/nova.py: invoke_nova(system_prompt: str, user_message: str) -> str
- backend/core/config.py: has MOCK_MODE bool
- backend/main.py: already imports and includes your router
All you need to build is your service file and your frontend page.

===FILE 1: backend/services/scam_detector.py===

FastAPI router with prefix /jobs.
Endpoint: POST /jobs/scan
Request body (Pydantic): JobScanRequest { url: Optional[str] = None, description: Optional[str] = None }

WORKFLOW:
1. Get text to analyze:
   - If url provided: scrape with httpx GET, timeout=10s, parse with BeautifulSoup get_text()
     On any exception (timeout, 403, DNS fail): fall back to description if provided
   - If no url or scrape failed and no description: return 400 error
   
2. Heuristic scan (runs BEFORE Nova — saves tokens, catches obvious scams instantly):
   RED_FLAGS = [
     "no interview required", "no experience needed", "earn $", "guaranteed income",
     "pay upfront", "purchase kit", "wire transfer", "western union", "advance payment",
     "@gmail.com", "@yahoo.com", "@hotmail.com",  # recruiter using free email
     "work from home earn", "limited slots", "urgent hiring 500", "joining fee",
     "registration fee", "training fee", "send cv on whatsapp"
   ]
   Count how many RED_FLAGS appear in text.lower()
   heuristic_flags = [flag for flag in RED_FLAGS if flag in text.lower()]
   base_risk_score = min(100, len(heuristic_flags) * 20)
   
3. If base_risk_score >= 80: SKIP Nova (it's an obvious scam, save tokens)
   Return: trust_score=10, fake_job_score=90, verdict="SCAM",
   risk_factors=heuristic_flags, reasoning="Multiple critical scam indicators detected automatically."

4. Otherwise: call invoke_nova with:
   System: "You are a job fraud analyst for an Indian job market. Analyze the job posting text.
   Return ONLY valid JSON, no markdown, no explanation:
   {semantic_trust_score: 0-100, risk_factors: list[str] (max 6), 
   verdict: 'SAFE'|'SUSPICIOUS'|'SCAM', reasoning: str (2 sentences max)}"
   User message: first 2000 chars of job text
   
5. Parse Nova JSON safely. If parse fails: use base heuristic score only.

6. Final calculation:
   nova_score = parsed.semantic_trust_score
   final_trust = round((nova_score * 0.7) + ((100 - base_risk_score) * 0.3))
   final_fake = 100 - final_trust
   
7. Return TrustReport Pydantic model:
   { trust_score: int, fake_job_score: int, verdict: str,
     risk_factors: list[str], heuristic_flags: list[str],
     reasoning: str, analyzed_at: datetime }

MOCK_MODE: if MOCK_MODE=true, skip all external calls and return:
{ trust_score:68, fake_job_score:32, verdict:"SUSPICIOUS",
  risk_factors:["Salary range not specified","Company LinkedIn has few followers"],
  heuristic_flags:[], reasoning:"Job posting appears mostly legitimate but lacks verifiable company details.",
  analyzed_at: datetime.now() }

===FILE 2: frontend/src/app/jobs/page.tsx===

3 states: 'idle' | 'loading' | 'result'

IDLE STATE:
- Page heading: "Job Scam Detector" + subtitle "Don't apply before ARIA checks it."
- Tab switcher: "Paste URL" | "Paste Description"
- URL tab: single text input + "🛡 Verify This Job" button
- Description tab: large textarea + same button
- Below: examples of caught scams (3 small grey cards with redacted fake job titles)

LOADING STATE:
- Centered ARIA icon + "Scanning job posting..." text
- Animated progress steps: "Fetching content → Checking red flags → Running AI analysis → Generating report"
- Each step lights up as it completes (simulated with 800ms intervals)

RESULT STATE:
Layout: left column (score + verdict) + right column (details)

Left:
- Large circular score ring using SVG donut
  green stroke (#06d6a0) if trust_score > 70
  yellow stroke (#f4a261) if trust_score 40-70  
  red stroke (#e94560) if trust_score < 40
- Center: fake_job_score% + label ("Low Risk" / "Moderate Risk" / "High Risk")
- Verdict badge below ring: large pill
  SAFE → green bg, SUSPICIOUS → yellow bg, SCAM → red bg + warning icon

Right:
- Risk factors list with ⚠ icon per item
- Heuristic flags list (if any) labelled "Auto-detected flags"
- Reasoning paragraph in a subtle card
- analyzed_at timestamp

Bottom: "Scan Another Job" button (resets to idle) + "Share Report" button

Return both files complete, no placeholders.
```

**Commit sequence for Archanya:**

```
~1:00  feat: scam_detector.py skeleton with heuristic engine + mock mode
~2:00  feat: httpx URL scraping + Nova semantic analysis integrated
~2:30  feat: skip-Nova optimization for high heuristic scores
~3:30  feat: jobs frontend page — idle + loading states
~4:30  feat: jobs result display with score ring + risk factors
~5:00  fix: scraping timeout handling + BeautifulSoup fallback
```

---

## Part 6: Agrani — Full Frontend + Resume RAG

You have the most work. Split it into two agent sessions back to back.

### Agent Prompt Part A: Full Frontend (Claude Opus 4.6 — use primary account)

```
You are a senior Next.js 14 engineer. Build the complete frontend scaffold for ARIA: Career Odyssey.

SETUP COMMANDS (run first):
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir --import-alias "@/*"
cd frontend
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs lucide-react

ADD to globals.css (inside @layer base or directly):
:root {
  --bg: #F9F9FB;
  --accent: #560BAD;
  --accent-hover: #7209B7;
  --mint: #00F5D4;
  --danger: #e94560;
  --warning: #f4a261;
  --success: #06d6a0;
  --text: #1a1a2e;
  --text-secondary: #555577;
}
body {
  background: radial-gradient(ellipse at top-left, #e8d5ff 0%, #d0f7f0 50%, #F9F9FB 100%);
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  color: var(--text);
}

ADD to tailwind.config.ts colors:
accent: '#560BAD', 'accent-hover': '#7209B7', mint: '#00F5D4',
danger: '#e94560', success: '#06d6a0', warning: '#f4a261'

SHARED COMPONENT: src/components/ScoreRing.tsx
Props: { score: number, size?: number, color?: string, label?: string }
SVG donut chart, animated strokeDashoffset from 0 to score on mount (1500ms ease-out),
score number counts up from 0 using useEffect + setInterval.

SHARED COMPONENT: src/components/SkillBadge.tsx
Props: { skill: string, type: 'matched' | 'missing' | 'neutral' }
matched → green pill, missing → red pill, neutral → purple pill

===FILE: src/lib/supabase.ts===
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
export const supabase = createClientComponentClient()

===FILE: src/middleware.ts===
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  return res
}
export const config = { matcher: ['/dashboard/:path*'] }

===FILE: src/app/login/page.tsx===
Centered full-page layout. Soft gradient bg.
Card: bg-white/70 backdrop-blur-md rounded-2xl border border-white/25 shadow-xl p-10 w-96
Content:
- ARIA+ logo text in accent color at top
- Heading: "Start your career odyssey"
- Sub: "Sign in to access ARIA's full career suite"
- "Continue with Google" button: white bg, Google colors, full width, rounded-xl
  onClick: supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/dashboard' }})
- "Continue with GitHub" button: dark bg, GitHub icon, full width
  onClick: supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: window.location.origin + '/dashboard' }})
- Small text: "By signing in, you agree to our Terms"

===FILE: src/app/dashboard/page.tsx===
Full dashboard layout. Use 'use client'.
On mount: fetch user session from supabase. Redirect to /login if no session.

LAYOUT:
- Outer: flex h-screen overflow-hidden
- Left sidebar: w-60 h-full bg-white/60 backdrop-blur-md border-r border-white/30 flex flex-col
  - Top: ARIA+ logo + "AI Career Copilot" subtitle (p-6)
  - Nav: list of links with lucide icons. Active link: bg-[#560BAD]/10 text-[#560BAD] rounded-xl
    Links: Dashboard(/dashboard), Interview Copilot(/interview), GitHub Auditor(/repo),
    Resume Analyzer(/resume), Job Tracker(/jobs), Roadmap(#), Analytics(#), Saved(#), Settings(#)
  - Bottom: plan card showing "⭐ Free Plan" with "Upgrade" button
- Main area: flex-1 overflow-y-auto p-8

MAIN AREA CONTENT:
- Top bar: "Welcome back, [user.name] 👋" h1 + subtitle + right side: upgrade button + notification bell + user avatar
- Subtitle: "Your AI copilot is ready to accelerate your career journey."
- 2x2 grid gap-6 mt-8 of 4 feature cards (see below)
- Bottom stats bar: 4 equal cells (Pro Tip | Weekly Goal | Skills in Focus | Career Progress)

4 FEATURE CARDS (each: bg-white/70 backdrop-blur-md rounded-2xl border border-white/25 shadow-lg p-6):

Card 1 - Interview:
Header: mic icon + "Live Interview Room" + green "● Live" badge (if active) + "Join Room →" link to /interview
Body: animated SVG wave visualization (3 purple arcs, CSS animation) + timer if active, else "Practice real-time. Get real-time feedback."
Footer: mock feedback bars (Clarity 92%, Confidence 87%, Structure 89%, Relevance 94%)

Card 2 - GitHub Auditor:
Header: code icon + "GitHub Repo Auditor" + "Scan New Repo →" link to /repo
Body: ScoreRing score=84 color="mint" on left + 6 sub-score items on right
Footer: "Last scanned: 2 hours ago" + "View Full Report →"
If no scan data: show URL input inline

Card 3 - Resume Analysis:
Header: file-text icon + "Resume RAG Analysis" + "Re-analyze →" link to /resume
Body: ScoreRing score=94 on left + matched skill badges on right
Footer: ATS bar 96% + "7 Improvement Suggestions"

Card 4 - Job Scam:
Header: target icon + "Fake Job Tracking" + "Scan New Job →" link to /jobs
Body: ScoreRing score=32 color="danger" label="Fake Score" on left + job details on right
Footer: "✓ This job looks mostly legitimate." in success color

FLOATING TOAST:
useEffect with setTimeout(10000): show toast bottom-right
className: "fixed bottom-6 right-6 bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-4 border border-white/30 flex items-center gap-3 z-50 animate-slide-in-right"
Content: 💡 icon + "Tip: Scan your GitHub first for a smarter interview experience!" + ✕ dismiss button
useState for visibility, clicking ✕ sets visible=false

===FILE: src/app/page.tsx (Landing Page)===
Build the full landing page with these sections in order:

1. NAVBAR: sticky, bg-white/80 backdrop-blur-sm, ARIA+ logo left, nav links center, Login + Get Started Free right

2. HERO: two column, 60/40 split
   Left: badge "+ AI CAREER COPILOT +", H1 "Want to land your\ndream tech job?" (dream tech = gradient purple→mint),
   p "ARIA is your AI-powered career copilot. From resume to offer.", 
   two CTAs, social proof "25,000+ tech professionals" with 5 avatar circles + stars
   Right: glassmorphic panel with floating stat cards around ARIA robot placeholder (white box with "ARIA" text for now)
   Stat cards: Career Match Score 92%, Job Opportunities 28, Skills Analyzed with 4 bars, Interview Prep Confidence 85%

3. FEATURES: "Everything you need to get hired" heading, 4 cards in 2x2 grid with icons + descriptions

4. HOW IT WORKS: 3 steps horizontal: Upload → ARIA Audits → Get Hired

5. SOCIAL PROOF: "Trusted by students from" + logos row (text logos: Google, Microsoft, Amazon, Meta, etc.)

6. STATS: 4 numbers: 25K+ Active Users, 98% Interview Success Rate, 10K+ Jobs Matched, 4.9/5 Rating

7. PRICING: 3 tier cards — Free(₹0), Pro(₹199/mo), Anime Unlock(₹49/skin)

8. CTA BANNER: "Ready to build the future you?" + Get Started Free button

9. FOOTER: logo + links + copyright

Return ALL files complete. Use real Tailwind classes throughout, no placeholder styles.
```

### Agent Prompt Part B: Resume RAG (Claude Sonnet 4.6 — secondary account)

```
Build the resume RAG analyzer for ARIA: Career Odyssey (FastAPI).

CONTEXT: Shared infrastructure already exists:
- backend/core/nova.py: invoke_nova(system_prompt: str, user_message: str) -> str
- backend/core/config.py: MOCK_MODE bool, SUPABASE_URL, SUPABASE_SERVICE_KEY
- boto3 credentials come from env vars — no manual setup needed

===FILE 1: backend/services/resume_rag.py===

FastAPI router prefix: /resume
Endpoint: POST /resume/analyze
Input: multipart/form-data — file: UploadFile, job_description: str = Form(default="")

WORKFLOW:
1. Read file bytes and detect type from content_type or filename extension
2. Extract text:
   - PDF (application/pdf or .pdf): pypdf PdfReader(BytesIO(content)), join all page text
   - Image (.jpg/.jpeg/.png/image/*): pytesseract.image_to_string(PIL.Image.open(BytesIO(content)))
   - On extraction failure: return 422 with detail "Could not extract text from file"
3. Limit resume_text to first 3000 characters (token safety)

4. Generate embedding of resume_text using:
   from sentence_transformers import SentenceTransformer
   model = SentenceTransformer('all-MiniLM-L6-v2')  # load once at module level, not per request
   embedding = model.encode(resume_text).tolist()

5. Query Supabase pgvector for top 5 similar market knowledge entries:
   Use supabase-py client with service key
   SQL: SELECT content, category FROM market_knowledge ORDER BY embedding <=> '[{embedding_str}]' LIMIT 5
   Build rag_context = "\n---\n".join([row["content"] for row in results])

6. Build Nova prompt:
   System: "You are a senior tech recruiter and career coach. Analyze the candidate resume against
   the target job description and market context. Return ONLY valid JSON, no markdown, no backticks:
   {match_score: 0-100, matched_skills: list[str], missing_skills: list[str],
   ats_compatibility: 0-100, top_job_recommendations: list[str] (exactly 3 job titles),
   improvement_suggestions: list[str] (max 5)}"
   User: "Resume:\n{resume_text}\n\nTarget JD:\n{job_description}\n\nMarket context:\n{rag_context}"

7. Call invoke_nova, parse JSON safely.

8. Return ResumeReport Pydantic model.

MOCK_MODE: return { match_score:87, matched_skills:["React","TypeScript","Node.js","AWS"],
missing_skills:["GraphQL","Docker","Redis"], ats_compatibility:91,
top_job_recommendations:["Senior Frontend Engineer","Full Stack Developer","React Native Developer"],
improvement_suggestions:["Add GraphQL to skills section","Quantify impact metrics","Add GitHub links to projects"] }

===FILE 2: backend/scripts/seed_knowledge.py===
One-time script to seed the pgvector knowledge base.
Run with: python -m backend.scripts.seed_knowledge

from sentence_transformers import SentenceTransformer
from supabase import create_client
from backend.core.config import SUPABASE_URL, SUPABASE_SERVICE_KEY

KNOWLEDGE_BASE = [
  {"category": "Frontend", "content": "React, Vue, Angular, TypeScript, Next.js, Tailwind CSS, Redux, React Query, Web performance, Core Web Vitals, CSS animations, responsive design, accessibility (a11y)"},
  {"category": "Backend", "content": "Node.js, Express, FastAPI, Django, REST APIs, GraphQL, gRPC, authentication (JWT, OAuth), rate limiting, caching, database design, API versioning"},
  {"category": "Cloud/AWS", "content": "AWS EC2, S3, Lambda, RDS, DynamoDB, CloudFront, IAM, VPC, ECS, API Gateway, CloudWatch, Terraform, CDK, infrastructure as code, serverless"},
  {"category": "Python", "content": "Python 3.11+, FastAPI, Django, Flask, pandas, numpy, scikit-learn, asyncio, type hints, pytest, virtual environments, pip, poetry"},
  {"category": "System Design", "content": "distributed systems, microservices, event-driven architecture, message queues (Kafka, RabbitMQ), load balancing, CDN, caching strategies (Redis), database sharding, CAP theorem"},
  {"category": "AI/ML", "content": "machine learning, deep learning, PyTorch, TensorFlow, scikit-learn, LLMs, prompt engineering, RAG, vector databases, embeddings, fine-tuning, model deployment"},
  {"category": "DevOps", "content": "Docker, Kubernetes, CI/CD, GitHub Actions, Jenkins, ArgoCD, monitoring (Prometheus, Grafana), logging, Linux, bash scripting, nginx"},
  {"category": "Databases", "content": "PostgreSQL, MySQL, MongoDB, Redis, DynamoDB, Elasticsearch, SQL optimization, indexing, transactions, ORMs, database migrations"},
  {"category": "Mobile", "content": "React Native, Flutter, iOS (Swift), Android (Kotlin), mobile performance, push notifications, offline support, app store deployment"},
  {"category": "Security", "content": "OWASP top 10, SQL injection prevention, XSS prevention, CSRF, input validation, secrets management, encryption, HTTPS, penetration testing basics"},
  {"category": "Testing", "content": "Jest, Vitest, pytest, unit testing, integration testing, E2E testing (Playwright, Cypress), TDD, code coverage, mocking"},
  {"category": "TypeScript", "content": "TypeScript, type safety, interfaces, generics, union types, decorators, strict mode, tsconfig, type utilities, zod schema validation"},
  {"category": "Soft Skills", "content": "system design communication, code review, technical documentation, agile/scrum, cross-functional collaboration, mentoring, estimation, problem decomposition"},
  {"category": "Web3/Blockchain", "content": "Solidity, Ethereum, smart contracts, Web3.js, ethers.js, DeFi protocols, NFTs, IPFS, wallet integration, gas optimization"},
  {"category": "Data Engineering", "content": "Apache Spark, Airflow, dbt, data pipelines, ETL, data warehouses (Snowflake, BigQuery), streaming data, Kafka, data modeling"},
]

model = SentenceTransformer('all-MiniLM-L6-v2')
supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

for item in KNOWLEDGE_BASE:
    embedding = model.encode(item["content"]).tolist()
    supabase_client.table("market_knowledge").insert({
        "content": item["content"],
        "category": item["category"],
        "embedding": embedding
    }).execute()
    print(f"Seeded: {item['category']}")

print("Knowledge base seeded successfully!")

===FILE 3: frontend/src/app/resume/page.tsx===
3 states: 'idle' | 'loading' | 'result'

IDLE STATE:
- Heading + subtitle
- File dropzone: dashed border, "📄 Drop your resume here or click to browse"
  Accept: .pdf, .jpg, .jpeg, .png. Show filename after selection.
  Use <input type="file"> hidden, label styled as dropzone.
- Job description textarea (optional): placeholder "Paste the job description for a more accurate analysis..."
- "🔍 Analyze My Resume" button — disabled until file selected

LOADING STATE:
- Centered card with ARIA icon
- "Analyzing your resume against live market data..."
- Animated progress: 4 steps (Extracting text → Embedding resume → Searching market data → Generating insights)
  Each step has a spinner that turns to ✓ when "complete" (simulated with 1200ms intervals)

RESULT STATE:
Top: "Your Resume Analysis" heading + "Re-analyze" button (resets to idle)

Row 1 - 2 column:
Left: ScoreRing score=result.match_score label="Match Score"
Right: two sub-sections:
  "✅ Matched Skills": SkillBadge type="matched" for each matched_skills[]
  "❌ Missing Skills": SkillBadge type="missing" for each missing_skills[]

Row 2: ATS bar: "ATS Compatibility" label + progress bar + percentage

Row 3: "Top Jobs For You Right Now" — 3 job recommendation cards with job title + "View Jobs →" button

Row 4: "Improvement Suggestions" — numbered list with improvement_suggestions[]

Return all 3 files complete, no placeholders.
```

**Commit sequence for Agrani:**

```
~0:25  chore: Next.js init + design tokens + shared components (ScoreRing, SkillBadge)
~1:00  feat: login page + Supabase auth + middleware
~1:45  feat: landing page hero + features + pricing sections
~2:30  feat: dashboard layout + sidebar + 4 feature cards + toast
~3:30  feat: resume_rag.py + seed_knowledge.py (mock mode)
~4:00  feat: resume frontend page — all 3 states
~4:30  feat: wire all backend APIs to dashboard (replace mock data)
~5:00  feat: Vercel deploy — set all env vars in Vercel dashboard
```

---

## Part 7: Integration Protocol (Hour 3:30)

At 3:30 everyone should have a working local service. Agrani wires them into the frontend. Here's the contract:

**Backend base URL in frontend:** `process.env.NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000` locally, real URL on prod)

**API call pattern in Next.js (use this everywhere):**

```typescript
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/interview/score`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ transcript, role, difficulty })
});
const data = await res.json();
```

**For file upload (resume):**

```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('job_description', jd);
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/resume/analyze`, {
  method: 'POST',
  body: formData  // no Content-Type header — browser sets it with boundary
});
```

**Dashboard shows mock data initially** — at 4:00, Agrani replaces mock data with real API calls. Don't wait for every service to be perfect before integrating.

---

## Part 8: Backend Deployment (Agrani + Kush — Hour 4:30)

Don't use Lambda — too complex to set up in this time. Use this instead:

### Option A: Railway (Easiest — Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli
railway login
railway init  # from backend/ directory
railway up
# Railway auto-detects Python, uses requirements.txt
# Set env vars in Railway dashboard → Variables
# Get your public URL from Railway dashboard
```

### Option B: Render (Free tier)

1. Push backend/ to GitHub (it's in the monorepo already)
2. render.com → New → Web Service → connect GitHub repo
3. Root directory: `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add all env vars in Render dashboard
7. Copy URL → paste into Vercel as `NEXT_PUBLIC_API_URL`

---

## Part 9: Token Conservation

### Model Assignment

| Task | Best Model | Account |
|------|-----------|---------|
| Big file scaffolds (nova.py, main.py, landing page) | Claude Opus 4.6 | Account 1 |
| Single-service backend files | Claude Sonnet 4.6 | Account 1 or 2 |
| Frontend page builds | Claude Sonnet 4.6 | Account 2 |
| Small fixes, single functions | Gemini 1.5 Flash | Gemini account |
| README, AI note, docs | Gemini 1.5 Pro | Gemini account |
| Debugging a specific error | Claude Sonnet 4.6 | Any remaining |

### Rules

- Use `MOCK_MODE=true` for the first 2 hours everywhere — don't burn AWS tokens on broken pipelines
- Every agent prompt asks for complete files with no placeholders — don't iterate in chat
- One prompt = one file or one closely related pair of files
- When stuck: `"Here is my current [filename]. I get this error: [paste error]. Fix only the broken function. Return only the corrected function."`
- Never ask "what do you think?" or "can you help me with?" — always a deliverable
- Commit immediately when agent outputs a working file — don't lose it in chat history

### When You're Out of Tokens

1. Switch to Gemini 1.5 Flash (free, no limits)
2. Paste: `"Here is a Python/TypeScript file. Add only this function: [name + description]. Return only the function."`
3. Don't start new conversation threads — stay in same thread for context

---

## Part 10: Git Commit Standards

| Prefix | When |
|--------|------|
| `feat:` | New working feature |
| `fix:` | Bug fixed |
| `chore:` | Config, env, setup, packages |
| `docs:` | README, comments, diagrams |
| `refactor:` | Restructured without behavior change |

**Rules:**

- Commit minimum every 45 minutes — judges check timestamp history
- Every commit touches a real code file (not just README)
- Push immediately after every commit
- Commit messages must be descriptive: `feat: add Nova JSON parsing with fallback to mock scores` not `feat: update file`

---

## Part 11: Final Hour (Hour 6–7)

| Task | Owner | Time |
|------|-------|------|
| Record 3-min demo (show all 4 features live) | Kush | 20 min |
| Write README from template below | Agrani | 15 min |
| Write 2-paragraph AI usage note | Kush | 10 min |
| Export architecture diagram PNG | Somya | 10 min |
| Build 5-slide PDF deck | Agrani | 15 min |
| Final Vercel deploy + smoke test | Agrani | 5 min |
| Paste submission link in hackathon portal | All | 5 min |

### README Template (fill blanks, keep it short)

```markdown
# ARIA: Career Odyssey
> AI-powered career companion for GenZ developers — built at IEEE AI FOR IMPACT 2026

## Problem
Engineering students face a fragmented, painful job hunt: no resume feedback, no interview practice, no way to verify job postings, and no visibility into their actual code quality. ARIA solves all four problems in one unified product.

## Solution
ARIA is a gamified career platform with 4 deeply integrated features:
1. **AI Voice Interviewer** — VAPI-powered real-time interview with animated ARIA avatar + 4-dimension scoring
2. **GitHub Repo Auditor** — Analyzes public repos via GitHub API, scores craftsmanship against engineering best practices
3. **Resume RAG Analyzer** — Matches resume against live market data (pgvector RAG) to find exact skill gaps
4. **Job Scam Detector** — Heuristic + AI analysis of job postings to protect students from fake listings

## Tech Stack
Next.js 14 · FastAPI · AWS Bedrock (Amazon Nova Pro) · Supabase pgvector · VAPI · Tailwind CSS · Vercel

## Live Demo
[paste Vercel URL]

## Setup
```bash
git clone [repo]
cp .env.example .env  # fill in all values
cd backend && pip install -r requirements.txt
python -m backend.scripts.seed_knowledge  # one-time RAG seed
uvicorn main:app --reload
cd ../frontend && npm install && npm run dev
```

## Architecture
![Architecture Diagram](./docs/architecture.png)

## How AI Is Used
[paste the AI usage note]
```

### AI Usage Note (Kush writes this)

```
ARIA uses AWS Amazon Nova Pro (via Bedrock) as the core AI reasoning model across all four features. Each service calls a shared invoke_nova() helper that passes a strict JSON-schema system prompt — Nova is instructed to return only valid JSON with no markdown or explanation, which is then parsed by Pydantic models in FastAPI. This enforces structured output and prevents hallucinated formatting.

The resume analyzer adds a RAG layer: resumes are embedded using sentence-transformers (all-MiniLM-L6-v2) and matched against a Supabase pgvector knowledge base of 15 engineering skill categories, giving Nova real-time market context beyond its training data. The scam detector runs heuristic pre-filtering before invoking Nova, automatically flagging obvious scams without using any LLM tokens — Nova is only called for ambiguous cases. The interview scorer evaluates VAPI-generated call transcripts across four weighted dimensions (Technical Accuracy 30%, Communication Clarity 25%, Problem-Solving Framework 25%, Code Realism 20%), producing a structured scorecard that the frontend animates with counting number effects.
```