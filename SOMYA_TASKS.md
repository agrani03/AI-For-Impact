# ✅ Somya's Task Checklist — ARIA: Career Odyssey

> Mark tasks as `[x]` when done. Work top to bottom — the order matters!

---

## 🔴 PHASE 1 — Infrastructure (0:00 → 0:25) — ✅ COMPLETE

### Task 1: AWS CLI Setup
- [x] Install AWS CLI (winget install Amazon.AWSCLI)
- [x] Verify: run `aws --version` → aws-cli/2.34.63

### Task 2: Create IAM User
- [x] Go to AWS Console → IAM → Users → **Create User**
- [x] Username: `aria-hackathon-agent`
- [x] Do NOT check "Enable console access"
- [x] Attach policies: `AmazonBedrockFullAccess` + `AmazonS3FullAccess`
- [x] Click Create User → Security credentials → **Create access key**
- [x] Use case: "Command Line Interface (CLI)"
- [x] Download the CSV file (has Access Key ID + Secret)

### Task 3: Configure AWS CLI
- [x] Run: `aws configure --profile aria`
- [x] Paste Access Key ID from CSV
- [x] Paste Secret Access Key from CSV
- [x] Region: `us-east-1`
- [x] Output: `json`
- [x] Verify: `aws sts get-caller-identity --profile aria` ✅

### Task 4: Enable Bedrock (Nova Pro)
- [x] Nova Pro auto-enabled (model access page retired)
- [x] Tested real Nova call via CLI — responded "ARIA online" ✅

### Task 5: Create S3 Bucket
- [x] Created bucket: `aria-resumes-2026`
- [x] Disabled public access block
- [x] Verified: `aws s3 ls --profile aria` ✅

### Task 6: Supabase Setup
- [x] Created project: `aria-career-odyssey`
- [x] Ran SQL schema (tables: `market_knowledge`, `profiles`, `scan_history` + vector + trigger)
- [x] Copied URL + anon key + service_role key

### Task 7: Build & Share .env 📌
- [x] Created `.env` with ALL values filled in
- [x] Added `.gitignore` to prevent secrets from being pushed
- [ ] **Share filled `.env` to team WhatsApp group** ← DO THIS IF NOT DONE YET
- [ ] **Pin the message**

### 🔥 COMMIT: `chore: add .gitignore, AWS and Supabase configured` ✅

---

## 🟡 PHASE 2 — Repo Auditor Backend Skeleton (0:25 → 1:00) — ✅ COMPLETE

### Task 8: Build `backend/services/repo_auditor.py` (Mock Mode)
- [x] Create FastAPI router with prefix `/repo`
- [x] Create Pydantic models:
  - `RepoAuditRequest` → `{ github_url: str }`
  - `RepoAuditResponse` → `{ craftsmanship_score, code_quality, security, maintainability, best_practices, test_coverage_inferred, tech_stack[], anti_patterns[], recommendations[], summary }`
- [x] Create endpoint: `POST /repo/audit`
- [x] Add MOCK_MODE check — returns hardcoded data when true
- [x] Test: started server, hit endpoint, confirmed mock response ✅

### 🔥 COMMIT: `feat: repo_auditor.py with mock mode, GitHub API, Nova scoring` ✅

---

## 🟡 PHASE 3 — Wire Real GitHub API + Nova (1:00 → 2:30) — ✅ COMPLETE

### Task 9: GitHub API — Fetch Repo Tree
- [x] Parse `owner` and `repo` from `github_url` using `urllib.parse`
- [x] Hit GitHub API tree endpoint
- [x] Handle 404 (private repo) → error response
- [x] Handle 403 (rate limit) → error response

### Task 10: GitHub API — Fetch File Contents
- [x] Detect tech stack from file extensions (TECH_STACK_MAP)
- [x] Fetch up to 3 files in priority order
- [x] Decode base64 content
- [x] Truncate each file to first 150 lines

### Task 11: Wire Nova AI Scoring
- [x] Import `invoke_nova` from `backend.core.nova`
- [x] Build system prompt (strict JSON schema output)
- [x] User message = stringified repo data
- [x] Parse JSON response safely with regex cleanup
- [x] If JSON parse fails → return default mid-range scores with error note

---

## 🟢 PHASE 4 — Repo Auditor Frontend Page (2:30 → 4:00) — ✅ COMPLETE

### Task 12: Build `frontend/src/app/repo/page.tsx`
- [x] **Idle State:**
  - [x] Page heading: "GitHub Repo Auditor"
  - [x] Subtitle: "ARIA reads your code like a senior engineer would."
  - [x] URL text input + "Scan" button
  - [x] Info note: "ℹ️ Works with public repos only."
  - [x] Example repo buttons (React, Next.js, FastAPI)

- [x] **Loading State:**
  - [x] Animated progress steps (4 steps, 1200ms each)
  - [x] Step indicators with checkmarks

- [x] **Result State:**
  - [x] Overall craftsmanship ScoreRing (160px)
  - [x] 6 score cards (2×3 grid) with ScoreRing components
  - [x] Color: green (>80), yellow (60-80), red (<60)
  - [x] Anti-patterns list with ⚠ icons
  - [x] Recommendations list with 💡 icons
  - [x] Tech stack as badges
  - [x] Summary paragraph
  - [x] "Scan Another" button

- [x] **Error State (Private Repo):**
  - [x] 🔒 icon + error message
  - [x] "Try Another Repo" + "Open GitHub Settings" buttons

- [x] Wire frontend to call `POST ${NEXT_PUBLIC_API_URL}/repo/audit`

### 🔥 COMMIT: `feat: repo audit frontend page — idle, loading, error, result states with ScoreRing` ✅

---

## 🔵 PHASE 5 — Testing & Bug Fixes (4:00 → 5:00) — ✅ COMPLETE

### Task 13: End-to-End Testing
- [x] Backend starts without errors (`uvicorn backend.main:app`)
- [x] Health endpoint works: `GET /health` → `"ARIA online"`
- [x] Repo audit endpoint works: `POST /repo/audit` → full response
- [x] Fixed scam_detector.py placeholder (was crashing server)
- [x] Installed all Python + Node dependencies

### 🔥 COMMIT: `fix: add scam_detector router placeholder so backend starts without errors` ✅

---

## 🔵 PHASE 6 — Knowledge Base & Polish (5:00 → 5:30) — ✅ COMPLETE

### Task 14: Write Knowledge Base
- [x] Updated `backend/knowledge/repo_standards.md`
- [x] Includes: architecture rules, common anti-patterns, best practices, scoring rubric, tech stack detection

### Task 15: UI Polish
- [x] ScoreRing animations integrated
- [x] Colors correct on all score ranges
- [x] Loading transitions with step indicators
- [x] Matches Cyber-Pastel Cream design system

---

## 🟣 PHASE 7 — Final Deliverables (5:30 → 6:30) — ✅ COMPLETE

### Task 16: Architecture Diagram
- [x] Created `ARCHITECTURE.md` with Mermaid diagrams:
  - High-level system architecture
  - Repo Auditor data flow (sequence diagram)
  - Team ownership map
  - Environment variables reference

### 🔥 COMMIT: `docs: add repo_standards knowledge base + architecture diagrams` ✅

### Task 17: Final Steps
- [x] All commits pushed to GitHub
- [x] Everything synced with remote
- [ ] Help team with any remaining issues
- [ ] Submit GitHub link together with team

---

## 📊 Quick Reference

| What | Where |
|------|-------|
| Your backend file | `backend/services/repo_auditor.py` |
| Your frontend page | `frontend/src/app/repo/page.tsx` |
| Your knowledge base | `backend/knowledge/repo_standards.md` |
| Your architecture doc | `ARCHITECTURE.md` |
| Shared Nova helper | `backend/core/nova.py` (Kush builds this, you use it) |
| Shared config | `backend/core/config.py` (Kush builds this, you use it) |

---

## 🏆 Commit History (6 commits by Somya)

1. `chore: add .gitignore, AWS and Supabase configured`
2. `feat: repo_auditor.py with mock mode, GitHub API, Nova scoring`
3. `feat: repo audit frontend page — idle, loading, error, result states with ScoreRing`
4. `fix: add scam_detector router placeholder so backend starts without errors`
5. `docs: add repo_standards knowledge base + architecture diagrams`

**Total tasks: 17 | Completed: 17 | Status: ALL DONE! 🎉**
