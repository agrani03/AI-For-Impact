# ARIA: Career Odyssey
## Product Requirements Document — Full Vision
**IEEE AI FOR IMPACT Hackathon | June 6, 2026**
**Team: Kush (Interview) · Somya (Repo Audit + AWS) · Archanya (Scam Detector) · Agrani (Frontend + Resume RAG)**

---

## 0. The Dream — Why This Product Exists

Every engineering student in India goes through the same painful loop: they apply to jobs with a resume no one reads, they practice interviews by talking to a wall, they don't know if their GitHub is impressive or embarrassing, and they've clicked at least one fake job link that wasted their time or worse, scammed them.

ARIA: Career Odyssey breaks that loop. It's not a tool. It's a career companion — the first one that actually *looks* like something GenZ would want to use every day. While every other team submits a dark-themed chatbot wrapper, the judge clicks our link and lands on something that feels like a premium consumer product. They see a clean, pastel-gradient landing page with an AI copilot character, a live score dashboard, pricing tiers, and four deeply integrated features that flow into each other.

The genius of the product is that all four hackathon problem statements aren't isolated pages — they're **phases of a single career pipeline**. You scan your GitHub first. That data feeds into your resume analysis. That feeds into your interview prep. And before you apply anywhere, ARIA checks if the job is even real. The judge doesn't see four features. They see one product.

The anime/GenZ hook is not a gimmick. 54% of GenZ identify with anime culture. ARIA's avatar — dressed in business attire, with full emotional animations — is a character they'll want to interact with. Optional paid skins (Gojo Satoru interviewing you, Captain America giving you career advice) create a monetization story that tells the judges this team thinks like a real startup.

This is what we're building. Let's make it real in 7 hours.

---

## 1. Product Identity

| Field | Value |
|-------|-------|
| **Product Name** | ARIA: Career Odyssey |
| **Tagline** | *"Want to land your dream tech job?"* |
| **Sub-tagline** | *"ARIA audits your code, preps your interview, reads your resume, and spots fake jobs — all in one place."* |
| **Target User** | Pre-final / final year CS/IT engineering students, 18–24, active on GitHub, GenZ |
| **Vibe** | Premium consumer product. Think Notion meets Duolingo meets an anime gacha game. |
| **Track** | AI for Employability — covers ALL 4 suggested problem statements |
| **Differentiator** | Every other team solves ONE problem statement. We solve all four in a single product with a cohesive career pipeline narrative. |

### The Pipeline Narrative (How Features Connect)
```
┌─────────────────────────────────────────────────────────────┐
│  ARIA: Career Odyssey — Your Career Pipeline                │
│                                                             │
│  [1. Scan GitHub] ──► [2. Analyze Resume] ──► [3. Interview]│
│                                    │                        │
│                          [4. Verify Job Before Applying]    │
└─────────────────────────────────────────────────────────────┘
```
The dashboard nudges users to complete all 4 steps in order. Each step's output enriches the next.

---

## 2. The ARIA Character — Brand Core

ARIA is not a chatbot. ARIA is a character.

**Default Look:** ARIA appears as a white-and-teal 3D robot (similar to the screenshots in the design reference — round head, glowing teal eyes, clean futuristic design) OR as a 2D anime character in formal business attire — blazer, confident posture, expressive face.

**Personality:** Encouraging, sharp, slightly playful. Talks to users like a senior friend who got placed at Google and actually wants to help. Never robotic, never corporate.

**Emotional States (shown via avatar expression):**
- Listening → subtle nod animation
- Thinking → eyes shift, small loading indicator
- Impressed → eyebrow raise, mint glow pulse
- Concerned (low score) → gentle frown, soft red tint
- Celebrating → bounce animation, confetti particles

**Premium Skins (Paid Tier — shows monetization thinking to judges):**
- Gojo Satoru (Jujutsu Kaisen) in a suit interviewing you
- Captain America giving career coaching
- Tony Stark doing your code review
- Iron Man scanning your resume ("Jarvis, analyze this")
- Default ARIA in various outfits (formal, casual, superhero)

Each skin costs ₹49. This is gamification and monetization in one feature.

---

## 3. Design System — Cyber-Pastel Cream

### Why Not Dark Mode?
Every single competing team will use dark mode because it "looks techy." We go the opposite direction. Cyber-Pastel Cream is light, premium, clean, and instantly recognizable. The judges have been staring at dark terminals and dark UIs all day. We hit them with something that looks like a funded startup product.

### Color Tokens
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#F9F9FB` | Page background base |
| `--surface` | `rgba(255,255,255,0.72)` | Cards, panels |
| `--accent` | `#560BAD` | Primary buttons, active states, links |
| `--accent-hover` | `#7209B7` | Button hover states |
| `--mint` | `#00F5D4` | Score rings, success states, highlights |
| `--danger` | `#e94560` | Scam alerts, low scores, errors |
| `--warning` | `#f4a261` | Medium risk, suggestions |
| `--success` | `#06d6a0` | High scores, verified badges |
| `--text-primary` | `#1a1a2e` | All body text |
| `--text-secondary` | `#555577` | Subtitles, placeholders |
| `--border` | `rgba(255,255,255,0.25)` | Card borders |

### Background
```css
body {
  background: radial-gradient(ellipse at top-left, #e8d5ff 0%, #d0f7f0 50%, #F9F9FB 100%);
  min-height: 100vh;
}
```
The gradient is subtle — lavender bleeds into mint, fading to cream. It moves slowly with a CSS animation on the gradient position, giving the whole app a "living" feel.

### Typography
| Use | Font | Weight | Size |
|-----|------|--------|------|
| Hero headlines | Inter | 800 | 56–72px |
| Section headings | Inter | 700 | 32–40px |
| Card titles | Inter | 600 | 20–24px |
| Body copy | Nunito | 400 | 16px |
| Labels / badges | Nunito | 600 | 12–14px |
| Code / scores | JetBrains Mono | 700 | varies |

### Component Classes (Tailwind)
```
// Glassmorphic Card
bg-white/70 backdrop-blur-md rounded-2xl border border-white/25 shadow-lg p-6

// Primary Button
bg-[#560BAD] hover:bg-[#7209B7] text-white rounded-xl px-6 py-3 font-semibold 
transition-all duration-200 hover:shadow-[0_0_20px_rgba(86,11,173,0.4)]

// Ghost Button
border-2 border-[#560BAD] text-[#560BAD] hover:bg-[#560BAD]/10 rounded-xl px-6 py-3 font-semibold

// Score Ring (SVG donut)
stroke: #00F5D4 on bg stroke #e8e8f0, strokeWidth: 8, animated strokeDashoffset

// Danger Badge
bg-[#e94560]/10 text-[#e94560] border border-[#e94560]/30 rounded-full px-3 py-1 text-xs font-bold

// Success Badge  
bg-[#06d6a0]/10 text-[#06d6a0] border border-[#06d6a0]/30 rounded-full px-3 py-1 text-xs font-bold

// Skill Tag
bg-[#560BAD]/10 text-[#560BAD] rounded-full px-3 py-1 text-sm font-medium

// Input Field
bg-white/60 border border-white/40 rounded-xl px-4 py-3 focus:border-[#560BAD] 
focus:ring-2 focus:ring-[#560BAD]/20 outline-none transition-all
```

### Spacing & Layout
- Page max-width: `1280px`, centered
- Dashboard sidebar: `240px` fixed width
- Card grid gap: `24px`
- Section padding: `80px` vertical on landing, `32px` on dashboard
- Border radius: `16px` (cards), `12px` (buttons/inputs), `8px` (badges)

### Animation Principles
- All transitions: `200ms ease-out`
- Score counters: count up from 0 over `1500ms` using easeOut curve
- Card hover: `translateY(-2px)` + shadow intensify
- Gradient background: slow `30s` infinite position shift
- Toast slide-in: `translateX(100%)` → `translateX(0)` over `300ms`
- Avatar expressions: CSS keyframe opacity crossfade, `300ms`

---

## 4. Page-by-Page UI Specification

### 4.1 Landing Page (`/`)

#### Navbar
```
[ARIA+ logo (purple)] ←————————————————————————→ [Features] [How it Works] [Success Stories] [Pricing] [Resources ▾] ←→ [Log in] [Get Started Free →]
```
- Sticky navbar, `bg-white/80 backdrop-blur-sm`
- On scroll past 100px: add `shadow-sm border-b border-white/30`
- "Get Started Free" button: primary style with subtle arrow icon

#### Hero Section
Two-column layout (60/40 split):

**Left Column:**
```
[small badge] + AI CAREER COPILOT FOR TECH PROFESSIONALS +

Want to land your
dream tech job?        ← "dream tech" in gradient: #560BAD → #00F5D4

ARIA is your AI-powered career copilot.
From resume to offer — we've got you.

[Get Started Free →]    [▶ See How It Works]

[avatar stack 5 faces] ★★★★★  Loved by 25,000+ tech professionals
```

**Right Column:** Floating glassmorphic cards arranged around the ARIA robot/anime avatar:
- Top card: "Career Match Score — 92% Excellent" (animated donut ring)
- Right card: "Job Opportunities — 28 High Match" (mini line graph)
- Left card: "Skills Analyzed — React 98%, System Design 95%, AWS 93%, TypeScript 90%"
- Bottom card: "Interview Preparation — Confidence 85% High"
- ARIA character centered, slightly floating (CSS `translateY` animation, 3s ease infinite)

#### Features Section (4 cards in 2×2 grid)
Each card: icon (colored), title, 2-line description, "→" arrow link

| Icon Color | Title | Description |
|------------|-------|-------------|
| 🟢 Teal | AI Interview Coach | Real-time mock interviews with smart scoring and ARIA avatar |
| 🟣 Purple | GitHub Repo Auditor | Deep code analysis — architecture, hygiene, craftsmanship score |
| 🩷 Pink | Resume RAG Analyzer | Match your resume to live market demands, find your skill gaps |
| 🔵 Blue | Job Scam Detector | Verify any job posting before you apply. Never get scammed again. |

#### "Your Dashboard Preview" Section
Show a cropped screenshot/mockup of the dashboard (as seen in design reference image 2) with caption: *"Everything you need. One place."*

#### How It Works (3 steps)
```
[1] Upload your resume + GitHub  →  [2] ARIA audits everything  →  [3] Get your roadmap to hired
```

#### Recruiter Discovery Section
Dark-ish glassmorphic banner:
```
"Your dream job. Our mission."
ARIA combines AI, data, and human expertise to help you stand out, get hired, and build the career you deserve.

[25K+ Active Users]  [98% Interview Success Rate]  [10K+ Jobs Matched]  [4.9/5 User Rating]

✦ Make your profile public — recruiters actively search ARIA for verified talent
```

#### Pricing Section (3 tiers)
```
┌──────────────┐  ┌──────────────────────┐  ┌──────────────┐
│   FREE       │  │   PRO  ← Popular     │  │ ANIME UNLOCK │
│   ₹0/mo      │  │   ₹199/mo            │  │  ₹49/skin    │
│              │  │                      │  │              │
│ 5 interviews │  │ Unlimited everything │  │ Gojo Satoru  │
│ 3 repo scans │  │ PDF audit reports    │  │ Captain America│
│ Resume check │  │ Recruiter visibility │  │ Iron Man     │
│ Scam detect  │  │ Priority processing  │  │ Tony Stark   │
│              │  │ Custom roadmaps      │  │ + more coming│
│[Get Started] │  │ [Start Free Trial]   │  │[Browse Skins]│
└──────────────┘  └──────────────────────┘  └──────────────┘
```

#### Footer
Logo, nav links, "Built with ❤️ at IEEE AI FOR IMPACT 2026", GitHub repo link.

---

### 4.2 Login Page (`/login`)
- Centered card, soft gradient background
- ARIA logo at top
- Headline: *"Start your career odyssey"*
- Two OAuth buttons: "Continue with Google 🔵" + "Continue with GitHub ⚫"
- Below: small text "By signing up, you agree to our Terms of Service"
- Subtle ARIA avatar graphic in the background, low opacity

---

### 4.3 Dashboard (`/dashboard`)

This is the most important screen. Judges will spend the most time here. Reference design image 2 exactly.

#### Layout
```
┌──────────────────┬─────────────────────────────────────────────────────┐
│  LEFT SIDEBAR    │  MAIN CONTENT AREA                                  │
│  240px fixed     │                                                     │
│                  │  Welcome back, [Name] 👋                            │
│  [ARIA+ logo]    │  Your AI copilot is ready to accelerate your        │
│  AI Career       │  career journey.                                    │
│  Copilot         │                                                     │
│                  │  ┌─────────────────────┐  ┌─────────────────────┐  │
│  ● Dashboard     │  │ Live Interview Room │  │ GitHub Repo Auditor │  │
│  ○ Interview     │  │ ● Live              │  │                     │  │
│  ○ GitHub Audit  │  │ [wave animation]    │  │ Trust Score: 89     │  │
│  ○ Resume Analy  │  │ 02:43              │  │ Code Quality: 92%   │  │
│  ○ Job Tracker   │  │ [feedback scores]   │  │ Security: 88%       │  │
│  ○ Roadmap       │  └─────────────────────┘  └─────────────────────┘  │
│  ○ Analytics     │                                                     │
│  ○ Saved         │  ┌─────────────────────┐  ┌─────────────────────┐  │
│  ○ Settings      │  │ Resume RAG Analysis │  │ Fake Job Tracking   │  │
│                  │  │ Match Score: 94%    │  │ Fake Job Score: 32% │  │
│  ─────────────   │  │ Top Skills: ...     │  │ ✓ Mostly Legit      │  │
│  [⭐ Pro Plan]   │  │ ATS: 96%           │  │ Risk Factors: 2/10  │  │
│  Renewal: ...    │  └─────────────────────┘  └─────────────────────┘  │
│  8450/10000 cr   │                                                     │
│  [Manage Plan]   │  Pro Tip | Weekly Goal | Skills in Focus | XP Bar  │
└──────────────────┴─────────────────────────────────────────────────────┘
```

#### Sidebar Details
- ARIA logo + "AI Career Copilot" subtitle at top
- Nav items with icons (lucide-react), active item highlighted with accent purple background
- Bottom: plan card showing tier, credits used, renewal date, gradient progress bar
- User avatar + name + plan badge at very top right of main area

#### Dashboard Feature Cards
Each of the 4 cards must feel like a live mini-dashboard, not a button:

**Card 1: Live Interview Room**
- Header: microphone icon + "Live Interview Room" + green "● Live" badge + "Join Room →" CTA
- Body: animated audio waveform rings (CSS, purple/mint gradient)
- Shows timer if session active, "Practice real-time. Get real-time feedback." otherwise
- Right side mini-panel: Interview Feedback bars (Clarity, Confidence, Structure, Relevance) with % values
- Footer: "End Session" button or "Start Session" depending on state

**Card 2: GitHub Repo Auditor**
- Header: code icon + "GitHub Repo Auditor" + "Scan New Repo →" CTA
- Body left: large circular Trust Score (89, animated donut in mint)
- Body right: 6 sub-scores in 2×3 grid — Code Quality, Security, Maintainability, Test Coverage, Best Practices, Dependency
- Footer: "Last scanned: 2 hours ago" + "View Full Report →"
- If never scanned: show "Paste your GitHub URL to get started" with input field

**Card 3: Resume RAG Analysis**
- Header: document icon + "Resume RAG Analysis" + "Re-analyze →" CTA
- Body left: Match Score donut (94%, "Excellent Match")
- Body right: "Top Matched Skills" — pill badges for TypeScript, React, Node.js, System Design, AWS, GraphQL, +4 more
- Footer: ATS Compatibility bar (96%) + "Improvement Suggestions: 7" count
- If no resume: upload dropzone inline in the card

**Card 4: Fake Job Tracking**
- Header: target icon + "Fake Job Tracking" + "Scan New Job →" CTA
- Body: Fake Job Score ring (32% = low risk = good, shown in green)
- Right side: Company, Job Title, Posted On, Risk Factors count, Analysis Confidence
- Footer: "✓ This job looks mostly legitimate." in green + "View Full Analysis →"

#### Bottom Stats Bar
Four equal-width cells across full width:
- 💡 Pro Tip: rotating tips about using ARIA
- 📅 Weekly Goal: "4 / 5 Interviews" with progress bar
- 🎯 Skills in Focus: TS, React, JS, AWS icons
- ⭐ Career Progress: "Level 12 — 3,240 / 5,000 XP" with XP bar (gamification!)

#### Top Bar
- Right: "⚡ Upgrade Plan" button + 🔔 notification bell (badge: 3) + user avatar + name + dropdown arrow
- "Customize Dashboard" button

#### Floating Toast
Appears 10 seconds after dashboard load, bottom-right, dismissible:
```
[💡] Pro Tip: Scan your GitHub repo before your next interview session — ARIA uses your code context to ask smarter questions.  [×]
```

---

### 4.4 Interview Feature Page (`/interview`)

#### Pre-Session Setup
```
┌─────────────────────────────────────────────────────────┐
│  Interview Copilot                                      │
│  "Let ARIA prep you like a senior engineer would."      │
│                                                         │
│  Select Role: [Frontend ▾]  Difficulty: [Medium ▾]     │
│  Focus Area: [System Design / DSA / Both]               │
│                                                         │
│  [▶ Start Interview Session]                            │
└─────────────────────────────────────────────────────────┘
```

#### Active Session
- **Default UI:** Large animated wave-orb (3 concentric SVG rings, pulsing in purple/mint, showing sound visualization)
- Center: timer counting up (02:43)
- Below orb: ARIA's last spoken text in a subtle card
- After **30 seconds**: soft toast slides in from bottom:
  > *"Bored with this ball? 👀 [Summon ARIA] →"*

#### Summoned ARIA Mode
Clicking "Summon ARIA" triggers:
1. Orb fades out (opacity 0, scale 0.8, 300ms)
2. ARIA character fades in (opacity 0 → 1, scale 0.9 → 1, 400ms)
3. ARIA stands in center frame, full body visible, business attire
4. Face expression changes based on audio sentiment keywords
5. "Switch to classic view" small link at top right for accessibility

#### Post-Session Score Report
Full-page result with 4 metric cards:
```
┌─────────────────────────────────────────────────────────────────┐
│  Interview Complete! Here's your ARIA Analysis                  │
│                                                                 │
│  Overall Score: 80/100                                          │
│  ████████░░ "Good fundamentals. Work on edge cases."           │
│                                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────┐│
│  │ Technical    │ │ Clarity      │ │ Framework    │ │ Code   ││
│  │ Accuracy     │ │              │ │              │ │ Realism││
│  │   82/100     │ │   78/100     │ │   85/100     │ │ 74/100 ││
│  │  ↑ counting  │ │  ↑ counting  │ │  ↑ counting  │ │ ...    ││
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────┘│
│                                                                 │
│  Improvements:                                                  │
│  • Mention time complexity when discussing algorithms           │
│  • Always ask clarifying questions before solving               │
│  • Add production-level error handling to your examples         │
│                                                                 │
│  [Start New Session]     [Download Report PDF]                  │
└─────────────────────────────────────────────────────────────────┘
```
Score numbers animate from 0 → final value over 1.5 seconds.

---

### 4.5 GitHub Repo Auditor Page (`/repo`)

```
┌─────────────────────────────────────────────────────────┐
│  GitHub Repo Auditor                                    │
│  "ARIA reads your code like a senior engineer would."   │
│                                                         │
│  [https://github.com/username/repo ____________] [Scan] │
│                                                         │
│  ℹ️ Works with public repos only.                       │
└─────────────────────────────────────────────────────────┘
```

#### Scanning State
- Progress bar with stages: "Fetching file tree... → Reading core files... → Analyzing patterns... → Generating report..."
- Each stage takes ~1–2 seconds, animated step indicator

#### Results
```
┌──────────────────────────────────────────────────────────┐
│  alexj/dev-portfolio                    [Private 🔒]    │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Trust Score  │  │ Code Quality │  │ Security     │  │
│  │    89        │  │    92%       │  │   88%        │  │
│  │  Excellent   │  │  Excellent   │  │   Good       │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │Maintainability│ │ Test Coverage│  │Best Practices│  │
│  │    90%       │  │   76%        │  │   91%        │  │
│  │  Excellent   │  │   Good       │  │  Excellent   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  Anti-Patterns Found:                                    │
│  ⚠ Hardcoded API keys found in config.js (Security)     │
│  ⚠ No error boundaries in React component tree          │
│  ℹ No test files detected (add Jest/Vitest)             │
│                                                          │
│  Tech Stack Detected: React, Node.js, MongoDB, Express  │
│                                                          │
│  [View Full Report]  [Share Report]  [Scan Another]     │
└──────────────────────────────────────────────────────────┘
```

**Private repo error state:**
```
🔒 This repository is locked.
ARIA can only analyze public repositories.
Make it public in GitHub Settings → Repository → Visibility, then try again.
[Open GitHub Settings ↗]
```

---

### 4.6 Resume Analyzer Page (`/resume`)

```
┌──────────────────────────────────────────────────────────┐
│  Resume RAG Analyzer                                     │
│  "Matched against real-time market demands."             │
│                                                          │
│  ┌──────────────────────────────┐                        │
│  │  📄 Drop your resume here   │   Supports PDF, PNG,   │
│  │  or click to browse         │   JPG, JPEG            │
│  └──────────────────────────────┘                        │
│                                                          │
│  Target Job Description (optional but recommended):      │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Paste the job description here...               │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  [🔍 Analyze My Resume]                                  │
└──────────────────────────────────────────────────────────┘
```

#### Results Layout
```
Match Score: 94%  ●══════════════════○  "Excellent Match"

┌─────────────────────────────┐  ┌─────────────────────────────┐
│  ✅ Matched Skills           │  │  ❌ Missing Skills            │
│  TypeScript  React  Node.js │  │  GraphQL  Docker  Redis      │
│  System Design  AWS  Next.js│  │  Kubernetes  Terraform       │
└─────────────────────────────┘  └─────────────────────────────┘

ATS Compatibility: ████████████████████░░ 96%

Top Jobs You Can Apply Right Now:
┌────────────────────────┐  ┌────────────────────────┐  ┌─────────────────────────┐
│ Senior Frontend Eng.   │  │ Full Stack Developer    │  │ React Native Developer  │
│ at Stripe — 95% match  │  │ at Razorpay — 91% match │  │ at CRED — 88% match     │
│ Remote · Full-time     │  │ Bangalore · Hybrid      │  │ Bangalore · Full-time   │
│ [View Job ↗]           │  │ [View Job ↗]            │  │ [View Job ↗]            │
└────────────────────────┘  └────────────────────────┘  └─────────────────────────┘

Improvement Suggestions (7):
• Add GraphQL to your skills section — high demand in 2025 market
• Quantify your impact: "Reduced load time by 40%" beats "Improved performance"
• Add a Projects section with GitHub links — 73% of hiring managers check repos
...
```

---

### 4.7 Job Scam Detector Page (`/jobs`)

```
┌──────────────────────────────────────────────────────────┐
│  Job Scam Detector                                       │
│  "Don't apply before ARIA checks it."                    │
│                                                          │
│  Paste a job URL:                                        │
│  [https://linkedin.com/jobs/view/12345 ________] [Scan] │
│                                                          │
│  — or paste the job description directly —               │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Paste job description text here...              │   │
│  └──────────────────────────────────────────────────┘   │
│  [🛡 Verify This Job]                                    │
└──────────────────────────────────────────────────────────┘
```

#### Results
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  TechNova Solutions — Senior Frontend Developer              │
│                                                              │
│       Fake Job Score                                         │
│           32%          ← green (low risk)                   │
│         Low Risk                                            │
│                                                              │
│  ✅ This job looks mostly legitimate.                        │
│                                                              │
│  Company:           TechNova Solutions                      │
│  Job Title:         Senior Frontend Developer               │
│  Risk Factors:      2 / 10                                  │
│  Posted on:         May 10, 2025                            │
│  Analysis Confidence: High                                  │
│                                                              │
│  Risk Factors Detected:                                     │
│  ⚠ Salary range not specified (minor flag)                  │
│  ⚠ Company LinkedIn has < 50 followers                     │
│                                                              │
│  Why it's mostly safe:                                      │
│  ✓ Domain registered 4 years ago                           │
│  ✓ No upfront payment requests                             │
│  ✓ Realistic job requirements for the role                 │
│  ✓ Interview process mentioned                             │
│                                                              │
│  Verdict: ┌────────────────────────────────────────────────┐│
│           │  ✅  MOSTLY SAFE — Proceed with caution        ││
│           └────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

High risk example (fake job):
- Score ring goes red (85%+ fake)
- Verdict badge: 🚨 LIKELY SCAM — Do Not Apply
- Full list of triggered red flags

---

## 5. Gamification Layer

This is what makes ARIA feel like a product, not a tool:

### XP & Levels
- Every action earns XP: +50 for completing an interview, +30 for scanning a repo, +20 for uploading a resume, +10 for scanning a job
- XP displayed on dashboard bottom bar: "Level 12 — 3,240 / 5,000 XP"
- Level names: Fresher → Intern → Junior → Mid-level → Senior → FAANG-Ready → Legend

### Streaks
- "Weekly Goal: 4/5 Interviews" progress bar
- Streak badge if user has used ARIA 3+ days in a row

### Profile Card (Public Mode)
When user makes profile public:
- Shows ARIA Level, top skills (from resume analysis), interview score average, GitHub craftsmanship score
- Recruiters can search by skill + location + score range
- This is the "recruiter discovery" feature that shows product depth

---

## 6. Technical Architecture

### Full Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui |
| Auth | Supabase Auth (Google OAuth + GitHub OAuth) |
| Backend | FastAPI (Python 3.11) on AWS EC2 t2.micro or Lambda |
| Core AI | AWS Bedrock — Amazon Nova Pro (`amazon.nova-pro-v1:0`) |
| Vector DB | Supabase pgvector (resume RAG knowledge base) |
| Voice Layer | VAPI (free dev tier — WebRTC, Whisper STT, ElevenLabs TTS) |
| File Storage | AWS S3 (resume uploads) |
| Frontend Host | Vercel |
| 3D Avatar | Three.js + @pixiv/three-vrm OR 2D PNG with CSS animations (fallback) |

### Backend File Structure
```
backend/
├── main.py                  ← FastAPI app, CORS, router registration
├── core/
│   ├── config.py            ← env vars, dotenv loading
│   └── nova.py              ← shared invoke_nova(system, user) → str
├── services/
│   ├── interviewer.py       ← POST /interview/score
│   ├── repo_auditor.py      ← POST /repo/audit
│   ├── resume_rag.py        ← POST /resume/analyze
│   └── scam_detector.py     ← POST /jobs/scan
├── knowledge/
│   ├── repo_standards.md    ← architecture rules, anti-patterns
│   └── market_skills.md     ← skill categories for RAG seed
├── scripts/
│   └── seed_knowledge.py    ← one-time pgvector seed
└── requirements.txt
```

### API Contracts
| Endpoint | Input | Output |
|----------|-------|--------|
| `POST /interview/score` | `{transcript, role, difficulty}` | `{technical, clarity, framework, realism, overall, summary, improvements[]}` |
| `POST /repo/audit` | `{github_url}` | `{craftsmanship_score, code_quality, security, maintainability, best_practices, test_coverage, anti_patterns[], recommendations[], tech_stack[]}` |
| `POST /resume/analyze` | `file (multipart) + job_description` | `{match_score, matched_skills[], missing_skills[], ats_compatibility, top_job_recommendations[], improvement_suggestions[]}` |
| `POST /jobs/scan` | `{url?, description?}` | `{trust_score, fake_job_score, verdict, risk_factors[], reasoning, heuristic_flags[], analyzed_at}` |
| `GET /user/profile` | Supabase JWT header | `{id, email, name, plan, xp, level, github_username}` |

### Data Flow Diagram
```
User (Browser)
    │
    ▼
Next.js Frontend (Vercel)
    │  REST API calls
    ▼
FastAPI Backend (AWS)
    ├─► /interview ──────────────────────────────► VAPI webhook ─► Nova ─► Score JSON
    │
    ├─► /repo ──────────────────────────────────► GitHub API ───► Nova ─► Report JSON
    │
    ├─► /resume ───► S3 (file store) ──► pypdf/OCR ──► pgvector similarity search
    │                                                         └──► Nova ─► Gap Report
    │
    └─► /jobs ──────────────────────────────────► httpx scrape ─► heuristics ─► Nova ─► Trust Score
                                                                          (skip Nova if score ≥80)

Supabase
    ├── Auth (Google + GitHub OAuth)
    ├── Users table
    └── market_knowledge table (pgvector)

AWS S3
    └── resume-uploads/{user_id}/{filename}
```

---

## 7. Database Schema

### Supabase Tables

```sql
-- Users (handled by Supabase Auth, extend with)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  name TEXT,
  github_username TEXT,
  plan TEXT DEFAULT 'free',
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector knowledge base for resume RAG
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE market_knowledge (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding VECTOR(384),
  category TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON market_knowledge USING ivfflat (embedding vector_cosine_ops);

-- Scan history (optional, for dashboard "last scanned" info)
CREATE TABLE scan_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  scan_type TEXT, -- 'interview' | 'repo' | 'resume' | 'job'
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. Pricing & Monetization

Showing this to judges proves the team thinks like a real startup — not just hackers.

| Tier | Price | Limits | Features |
|------|-------|--------|---------|
| **Free** | ₹0 | 5 interviews/mo, 3 repo scans/mo | All core features, basic reports |
| **Pro** | ₹199/mo | Unlimited | + PDF reports, recruiter visibility, priority processing, custom roadmaps |
| **Anime Unlock** | ₹49/skin | Per skin | Gojo, Captain America, Iron Man, Tony Stark + more releasing monthly |
| **Recruiter** | ₹999/mo | — | Search verified student profiles by skill, score, location |

The Anime tier is the most important signal: it shows that the team understands their audience well enough to monetize attention, not just utility.

---

## 9. Submission Requirements Checklist

| Item | Owner | Deadline |
|------|-------|---------|
| Source code committed (incremental history) | All | Continuous |
| README with PS, solution, stack, setup, demo URL | Agrani | Hour 6:30 |
| Architecture diagram PNG in README | Somya | Hour 5:30 |
| Short note on how AI is used (2 paragraphs) | Kush | Hour 6:00 |
| Demo video (3 min, shows all 4 features live) | Kush | Hour 6:00 |
| Presentation deck (5 slides, PDF) | Agrani | Hour 6:30 |
| Live Vercel deploy URL | Agrani | Hour 5:00 |
| GitHub repo link submitted | All | Hour 7:00 |

### 5-Slide Deck Outline
1. **Problem** — The painful loop every engineering student is stuck in
2. **Solution** — ARIA: Career Odyssey (the 4-phase pipeline)
3. **Demo Screenshots** — Landing page, dashboard, key feature results
4. **Architecture** — One clean diagram showing tech stack + data flow
5. **Impact + Pricing** — Who it helps, market size, monetization vision

---

## 10. What Makes This Win

1. **It solves all 4 PSs** — no other team will do this under one product narrative
2. **The design is premium** — judges will screenshot the landing page
3. **It has a character** — ARIA is memorable. Chatbots are forgettable.
4. **It has a business model** — IEEE TEMS judges specifically care about engineering management thinking
5. **The pipeline connects everything** — GitHub data feeds interviews, resume data feeds job matching. It's a product, not 4 features.
6. **It's GenZ native** — anime skins, XP levels, streaks. This audience *is* the target user.
