# ✅ Somya's Task Checklist — ARIA: Career Odyssey

> Mark tasks as `[x]` when done. Work top to bottom — the order matters!

---

## 🔴 PHASE 1 — Infrastructure (0:00 → 0:25) — TEAM IS BLOCKED UNTIL THIS IS DONE

### Task 1: AWS CLI Setup
- [ ] Install AWS CLI (`brew install awscli` on Mac / use installer on Windows)
- [ ] Verify: run `aws --version`

### Task 2: Create IAM User
- [ ] Go to AWS Console → IAM → Users → **Create User**
- [ ] Username: `aria-hackathon-agent`
- [ ] Do NOT check "Enable console access"
- [ ] Attach policies: `AmazonBedrockFullAccess` + `AmazonS3FullAccess`
- [ ] Click Create User → Security credentials → **Create access key**
- [ ] Use case: "Command Line Interface (CLI)"
- [ ] Download the CSV file (has Access Key ID + Secret)

### Task 3: Configure AWS CLI
- [ ] Run: `aws configure --profile aria`
- [ ] Paste Access Key ID from CSV
- [ ] Paste Secret Access Key from CSV
- [ ] Region: `us-east-1`
- [ ] Output: `json`
- [ ] Verify: `aws sts get-caller-identity --profile aria`

### Task 4: Enable Bedrock (Nova Pro)
- [ ] AWS Console → Bedrock → Model Access → Find "Amazon Nova Pro" → **Request Access**
- [ ] Wait ~2 min for approval
- [ ] Verify via CLI:
  ```
  aws bedrock get-foundation-model --model-identifier amazon.nova-pro-v1:0 --region us-east-1 --profile aria
  ```
- [ ] Test a real Nova call from CLI to confirm it responds

### Task 5: Create S3 Bucket
- [ ] Run:
  ```
  aws s3api create-bucket --bucket aria-resumes-2026 --region us-east-1 --profile aria
  ```
- [ ] Disable public access block:
  ```
  aws s3api delete-public-access-block --bucket aria-resumes-2026 --profile aria
  ```
- [ ] Verify: `aws s3 ls --profile aria`

### Task 6: Supabase Setup
- [ ] Go to [supabase.com](https://supabase.com) → New Project → name: `aria-career-odyssey`
- [ ] Wait ~2 min for provisioning
- [ ] Go to SQL Editor → paste and run the full SQL schema (tables: `market_knowledge`, `profiles`, `scan_history` + vector extension + trigger)
- [ ] Go to Settings → API → copy **URL**, **anon key**, **service_role key**
- [ ] Go to Authentication → Providers → Enable **Google** OAuth
  - [ ] Create OAuth app at [console.cloud.google.com](https://console.cloud.google.com)
  - [ ] Copy Client ID + Secret → paste into Supabase
- [ ] Enable **GitHub** OAuth
  - [ ] GitHub → Settings → Developer Settings → OAuth Apps → New App
  - [ ] Callback URL: `https://[your-project].supabase.co/auth/v1/callback`
  - [ ] Copy Client ID + Secret → paste into Supabase

### Task 7: Build & Share .env 📌
- [ ] Create `.env` file with ALL values filled in:
  ```
  AWS_ACCESS_KEY_ID=AKIA...
  AWS_SECRET_ACCESS_KEY=...
  AWS_REGION=us-east-1
  AWS_PROFILE=aria
  BEDROCK_MODEL_ID=amazon.nova-pro-v1:0
  S3_BUCKET_NAME=aria-resumes-2026
  SUPABASE_URL=https://xxxx.supabase.co
  SUPABASE_ANON_KEY=eyJ...
  SUPABASE_SERVICE_KEY=eyJ...
  NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
  NEXT_PUBLIC_API_URL=http://localhost:8000
  VAPI_API_KEY=...          ← get from Kush or dashboard.vapi.ai
  NEXT_PUBLIC_VAPI_PUBLIC_KEY=...
  MOCK_MODE=false
  ```
- [ ] **Share filled `.env` to team WhatsApp group**
- [ ] **Pin the message**

### 🔥 COMMIT: `chore: AWS CLI configured, .env shared, Supabase SQL run`

---

## 🟡 PHASE 2 — Repo Auditor Backend Skeleton (0:25 → 1:00)

### Task 8: Build `backend/services/repo_auditor.py` (Mock Mode)
- [ ] Create FastAPI router with prefix `/repo`
- [ ] Create Pydantic models:
  - `RepoAuditRequest` → `{ github_url: str }`
  - `RepoAuditResponse` → `{ craftsmanship_score, code_quality, security, maintainability, best_practices, test_coverage_inferred, tech_stack[], anti_patterns[], recommendations[], summary }`
- [ ] Create endpoint: `POST /repo/audit`
- [ ] Add MOCK_MODE check — if `MOCK_MODE=true`, return hardcoded data:
  ```python
  craftsmanship_score=84, code_quality=88, security=76,
  maintainability=82, best_practices=90, test_coverage_inferred=60,
  tech_stack=["React","Node.js","MongoDB"],
  anti_patterns=["No error boundaries","Hardcoded config values"],
  recommendations=["Add Jest tests","Use environment variables for all config"],
  summary="Solid project structure with good component organization..."
  ```
- [ ] Test: start server, hit endpoint with curl/Postman, confirm mock response

### 🔥 COMMIT: `feat: repo_auditor.py skeleton with mock mode working`

---

## 🟡 PHASE 3 — Wire Real GitHub API + Nova (1:00 → 2:30)

### Task 9: GitHub API — Fetch Repo Tree
- [ ] Parse `owner` and `repo` from `github_url` using `urllib.parse`
- [ ] Hit: `GET https://api.github.com/repos/{owner}/{repo}/git/trees/HEAD?recursive=1`
- [ ] Headers: `{"Accept": "application/vnd.github.v3+json", "User-Agent": "ARIA-Auditor"}`
- [ ] If 404 or private repo → return error response with `craftsmanship_score=0` and message

### Task 10: GitHub API — Fetch File Contents
- [ ] From the tree, detect tech stack from file extensions
- [ ] Fetch up to 3 files in priority order:
  1. `main.py` OR `index.js` OR `App.tsx` OR `server.js`
  2. `package.json` OR `requirements.txt`
  3. `README.md`
- [ ] Use: `GET https://api.github.com/repos/{owner}/{repo}/contents/{path}`
- [ ] Decode base64 content
- [ ] Truncate each file to first 150 lines

### 🔥 COMMIT: `feat: GitHub API tree fetch + file content extraction`

### Task 11: Wire Nova AI Scoring
- [ ] Import `invoke_nova` from `backend.core.nova`
- [ ] Build system prompt (strict JSON schema output)
- [ ] User message = stringified repo data (structure + file contents)
- [ ] Call `invoke_nova(system_prompt, user_message)`
- [ ] Parse JSON response safely
- [ ] If JSON parse fails → return default mid-range scores with error note
- [ ] Return full `RepoAuditResponse`

### 🔥 COMMIT: `feat: Nova scoring integrated, JSON parsing with fallback`

---

## 🟢 PHASE 4 — Repo Auditor Frontend Page (2:30 → 4:00)

### Task 12: Build `frontend/src/app/repo/page.tsx`
- [ ] **Idle State:**
  - [ ] Page heading: "GitHub Repo Auditor"
  - [ ] Subtitle: "ARIA reads your code like a senior engineer would."
  - [ ] URL text input + "Scan" button
  - [ ] Info note: "ℹ️ Works with public repos only."

- [ ] **Loading State:**
  - [ ] Centered spinner/icon
  - [ ] Animated progress steps (simulated, 800ms each):
    - Fetching file tree...
    - Reading core files...
    - Analyzing patterns...
    - Generating report...

- [ ] **Result State:**
  - [ ] Repo name header
  - [ ] 6 score cards (2×3 grid) with count-up animations:
    - Craftsmanship Score, Code Quality, Security
    - Maintainability, Test Coverage, Best Practices
  - [ ] Color: green (>80), yellow (60-80), red (<60)
  - [ ] Anti-patterns list with ⚠ icons
  - [ ] Tech stack as badges
  - [ ] Summary paragraph
  - [ ] Buttons: "Scan Another" + "Share Report"

- [ ] **Error State (Private Repo):**
  - [ ] 🔒 icon + "This repository is locked."
  - [ ] Explanation + link to GitHub settings

- [ ] Wire frontend to call `POST ${NEXT_PUBLIC_API_URL}/repo/audit`

### 🔥 COMMIT: `feat: repo audit frontend page wired to backend`

---

## 🔵 PHASE 5 — Testing & Bug Fixes (4:00 → 5:00)

### Task 13: End-to-End Testing
- [ ] Test with a real public GitHub repo URL
- [ ] Verify full flow: frontend → backend → GitHub API → Nova → response → UI display
- [ ] Test private repo URL → verify error message shows correctly
- [ ] Test invalid URL → verify graceful handling
- [ ] Test GitHub API rate limiting → add safety handling

### 🔥 COMMIT: `fix: private repo error handling + rate limit safety`

---

## 🔵 PHASE 6 — Knowledge Base & Polish (5:00 → 5:30)

### Task 14: Write Knowledge Base
- [ ] Create `backend/knowledge/repo_standards.md`
- [ ] Include: architecture rules, common anti-patterns, best practices checklist

### Task 15: UI Polish
- [ ] Score count-up animations working smoothly
- [ ] Colors correct on all score ranges
- [ ] Loading transitions feel smooth
- [ ] No console errors

### ⛔ CHECKPOINT @ 5:30 — CODE FREEZE. Only bug fixes after this!

---

## 🟣 PHASE 7 — Final Deliverables (5:30 → 6:30)

### Task 16: Architecture Diagram
- [ ] Create a clear architecture diagram showing:
  - User (Browser) → Next.js (Vercel) → FastAPI Backend
  - Backend → GitHub API, Nova (Bedrock), Supabase (pgvector), S3, VAPI
  - Supabase → Auth + Users + market_knowledge
- [ ] Export as PNG → save to `docs/architecture.png`
- [ ] Archanya helps with this

### 🔥 COMMIT: `docs: architecture diagram added to README`

### Task 17: Final Steps
- [ ] Push all final commits
- [ ] Verify everything is on GitHub
- [ ] Help team with any remaining issues
- [ ] Submit GitHub link together with team

---

## 📊 Quick Reference

| What | Where |
|------|-------|
| Your backend file | `backend/services/repo_auditor.py` |
| Your frontend page | `frontend/src/app/repo/page.tsx` |
| Your knowledge base | `backend/knowledge/repo_standards.md` |
| Your diagram | `docs/architecture.png` |
| Shared Nova helper | `backend/core/nova.py` (Kush builds this, you use it) |
| Shared config | `backend/core/config.py` (Kush builds this, you use it) |

---

**Total commits: 8 | Total tasks: 17 | Go go go! 🚀**
