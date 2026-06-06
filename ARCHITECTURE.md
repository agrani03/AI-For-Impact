# ARIA: Career Odyssey — Architecture

> System architecture document for hackathon judges and teammates.

## High-Level Architecture

```mermaid
graph TB
    subgraph Frontend["🖥️ Frontend — Next.js 14"]
        LP[Landing Page]
        LG[Login / Signup]
        DB[Dashboard]
        IV[Interview Coach]
        RA[Repo Auditor]
        RS[Resume Analyzer]
        JB[Job Scanner]
    end

    subgraph Backend["⚙️ Backend — FastAPI"]
        MW[CORS Middleware]
        RT[API Router]
        IS[interviewer.py]
        RAS[repo_auditor.py]
        RRS[resume_rag.py]
        SD[scam_detector.py]
        NV[nova.py — Shared LLM Helper]
        CF[config.py]
    end

    subgraph AWS["☁️ AWS Cloud"]
        BR[Amazon Bedrock — Nova Pro]
        S3[S3 — Resume Storage]
    end

    subgraph Supabase["🗄️ Supabase"]
        AU[Auth — Login/Signup]
        PG[PostgreSQL + pgvector]
        MK[market_knowledge table]
        PR[profiles table]
        SH[scan_history table]
    end

    subgraph External["🌐 External APIs"]
        GH[GitHub API]
        VP[VAPI — Voice AI]
    end

    LP --> LG
    LG --> AU
    AU --> DB
    DB --> IV & RA & RS & JB

    IV --> RT --> IS --> NV --> BR
    IV --> VP
    RA --> RT --> RAS --> NV
    RAS --> GH
    RS --> RT --> RRS --> NV
    RRS --> S3
    JB --> RT --> SD --> NV

    RRS --> MK
    IS --> SH
    RAS --> SH
```

## Data Flow — Repo Auditor (Somya's Feature)

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend (repo/page.tsx)
    participant B as Backend (repo_auditor.py)
    participant G as GitHub API
    participant N as Nova Pro (Bedrock)

    U->>F: Paste GitHub URL
    F->>B: POST /repo/audit {github_url}
    
    alt MOCK_MODE = true
        B-->>F: Return hardcoded mock data
    else MOCK_MODE = false
        B->>G: GET /repos/{owner}/{repo}/git/trees/HEAD
        G-->>B: File tree (all paths)
        B->>B: Detect tech stack from file extensions
        B->>G: GET /repos/{owner}/{repo}/contents/{file}
        G-->>B: File contents (up to 3 priority files)
        B->>N: invoke_nova(system_prompt, repo_data)
        N-->>B: JSON scores + analysis
        B->>B: Parse & validate JSON
        B-->>F: RepoAuditResponse
    end
    
    F->>F: Display ScoreRings + recommendations
    F-->>U: Visual audit report
```

## Team Ownership Map

| Component | Owner | File(s) |
|-----------|-------|---------|
| Landing + Dashboard + Resume UI | Agrani | `page.tsx`, `dashboard/page.tsx`, `resume/page.tsx` |
| Interview Coach (backend + frontend) | Kush | `interviewer.py`, `interview/page.tsx` |
| **Repo Auditor (backend + frontend)** | **Somya** | **`repo_auditor.py`, `repo/page.tsx`** |
| Scam Detector | Archanya | `scam_detector.py`, `jobs/page.tsx` |
| Shared LLM Helper | Kush | `nova.py`, `config.py` |
| AWS Infrastructure | Somya | IAM, Bedrock, S3, `.env` |
| Supabase Schema | Somya | SQL migration |
| Frontend Scaffold | Agrani | Layout, globals.css, components |

## Environment Variables

| Variable | Used By | Source |
|----------|---------|--------|
| `AWS_ACCESS_KEY_ID` | nova.py | IAM Console |
| `AWS_SECRET_ACCESS_KEY` | nova.py | IAM Console |
| `AWS_REGION` | nova.py | `us-east-1` |
| `BEDROCK_MODEL_ID` | nova.py | `amazon.nova-pro-v1:0` |
| `S3_BUCKET_NAME` | resume_rag.py | `aria-resumes-2026` |
| `SUPABASE_URL` | All services | Supabase Dashboard |
| `SUPABASE_ANON_KEY` | Frontend | Supabase Dashboard |
| `SUPABASE_SERVICE_KEY` | Backend | Supabase Dashboard |
| `MOCK_MODE` | All services | `true` / `false` |
| `VAPI_API_KEY` | Interview Coach | VAPI Dashboard |
