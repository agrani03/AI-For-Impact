"""GitHub Repository Auditor — Somya's feature for ARIA: Career Odyssey."""

import json
import os
import re
import base64
from datetime import datetime
from typing import Optional
from urllib.parse import urlparse

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.core.config import MOCK_MODE
from backend.core.nova import invoke_nova

router = APIRouter(prefix="/repo", tags=["repo-auditor"])

# ──────────────────────────────────────────────
# Pydantic models
# ──────────────────────────────────────────────

class RepoAuditRequest(BaseModel):
    github_url: str


class RepoAuditResponse(BaseModel):
    craftsmanship_score: int = 0
    code_quality: int = 0
    security: int = 0
    maintainability: int = 0
    best_practices: int = 0
    test_coverage_inferred: int = 0
    tech_stack: list[str] = []
    anti_patterns: list[str] = []
    recommendations: list[str] = []
    summary: str = ""
    error: Optional[str] = None


# ──────────────────────────────────────────────
# Mock data for MOCK_MODE
# ──────────────────────────────────────────────

MOCK_RESULT = RepoAuditResponse(
    craftsmanship_score=84,
    code_quality=88,
    security=76,
    maintainability=82,
    best_practices=90,
    test_coverage_inferred=60,
    tech_stack=["React", "Node.js", "MongoDB"],
    anti_patterns=["No error boundaries", "Hardcoded config values"],
    recommendations=["Add Jest tests", "Use environment variables for all config"],
    summary="Solid project structure with good component organization. Security and test coverage need attention.",
)

GITHUB_HEADERS = {
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "ARIA-Auditor",
}

# File extensions → tech stack mapping
TECH_STACK_MAP = {
    "package.json": "Node.js",
    "requirements.txt": "Python",
    "Cargo.toml": "Rust",
    "go.mod": "Go",
    "pom.xml": "Java",
    "build.gradle": "Java",
    "Gemfile": "Ruby",
    "composer.json": "PHP",
    ".tsx": "React",
    ".jsx": "React",
    ".vue": "Vue.js",
    ".svelte": "Svelte",
    ".dart": "Flutter",
    ".swift": "Swift",
    ".kt": "Kotlin",
    "Dockerfile": "Docker",
    "docker-compose.yml": "Docker",
    ".prisma": "Prisma",
    "next.config": "Next.js",
    "vite.config": "Vite",
    "tailwind.config": "Tailwind CSS",
    "tsconfig.json": "TypeScript",
}

# Priority list for fetching file contents
PRIORITY_FILES = [
    ["main.py", "index.js", "App.tsx", "app.tsx", "server.js", "index.ts", "main.ts"],
    ["package.json", "requirements.txt", "Cargo.toml", "go.mod"],
    ["README.md", "readme.md"],
]


# ──────────────────────────────────────────────
# Helper functions
# ──────────────────────────────────────────────

def parse_github_url(url: str) -> tuple[str, str]:
    """Extract owner and repo name from a GitHub URL."""
    url = url.strip().rstrip("/")
    # Handle formats: https://github.com/owner/repo, github.com/owner/repo
    parsed = urlparse(url if url.startswith("http") else f"https://{url}")
    parts = [p for p in parsed.path.strip("/").split("/") if p]
    if len(parts) < 2:
        raise ValueError("Invalid GitHub URL — expected https://github.com/owner/repo")
    owner, repo = parts[0], parts[1].replace(".git", "")
    return owner, repo


def detect_tech_stack(file_paths: list[str]) -> list[str]:
    """Detect tech stack from file paths in the repo tree."""
    stack = set()
    for path in file_paths:
        basename = path.split("/")[-1]
        # Check exact filename matches
        if basename in TECH_STACK_MAP:
            stack.add(TECH_STACK_MAP[basename])
        # Check extension matches
        for ext, tech in TECH_STACK_MAP.items():
            if ext.startswith(".") and basename.endswith(ext):
                stack.add(tech)
            elif not ext.startswith(".") and ext in basename:
                stack.add(tech)
    return sorted(stack)


async def fetch_repo_tree(owner: str, repo: str) -> list[str]:
    """Fetch the full file tree of a GitHub repo."""
    url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/HEAD?recursive=1"
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(url, headers=GITHUB_HEADERS)
    if resp.status_code == 404:
        raise HTTPException(status_code=404, detail="repo_not_found")
    if resp.status_code == 403:
        raise HTTPException(status_code=429, detail="GitHub API rate limit hit. Try again in a minute.")
    resp.raise_for_status()
    tree = resp.json().get("tree", [])
    return [item["path"] for item in tree if item["type"] == "blob"]


async def fetch_file_content(owner: str, repo: str, path: str) -> str:
    """Fetch and decode a single file's content from a GitHub repo."""
    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(url, headers=GITHUB_HEADERS)
    if resp.status_code != 200:
        return ""
    data = resp.json()
    content = data.get("content", "")
    try:
        decoded = base64.b64decode(content).decode("utf-8", errors="replace")
        # Truncate to first 150 lines
        lines = decoded.split("\n")[:150]
        return "\n".join(lines)
    except Exception:
        return ""


async def fetch_priority_files(owner: str, repo: str, file_paths: list[str]) -> dict[str, str]:
    """Fetch up to 3 files based on priority order."""
    fetched = {}
    for priority_group in PRIORITY_FILES:
        if len(fetched) >= 3:
            break
        for candidate in priority_group:
            matching = [p for p in file_paths if p.endswith(candidate)]
            if matching:
                content = await fetch_file_content(owner, repo, matching[0])
                if content:
                    fetched[matching[0]] = content
                break
    return fetched


# ──────────────────────────────────────────────
# Nova scoring prompt
# ──────────────────────────────────────────────

SYSTEM_PROMPT = (
    "You are a senior software engineer doing a code review. "
    "Evaluate the provided repository data and return ONLY valid JSON "
    "with no markdown, no explanation, no backticks. JSON schema: "
    '{"craftsmanship_score": 0-100, "code_quality": 0-100, "security": 0-100, '
    '"maintainability": 0-100, "best_practices": 0-100, "test_coverage_inferred": 0-100, '
    '"tech_stack": ["string"], "anti_patterns": ["string"] (max 5), '
    '"recommendations": ["string"] (max 5), '
    '"summary": "string (2 sentences max)"}'
)

DEFAULT_SCORES = RepoAuditResponse(
    craftsmanship_score=65,
    code_quality=65,
    security=60,
    maintainability=65,
    best_practices=60,
    test_coverage_inferred=40,
    tech_stack=[],
    anti_patterns=["Could not fully analyze — partial results"],
    recommendations=["Ensure repo is public and has standard project structure"],
    summary="Partial analysis completed. Some scores are estimated due to parsing limitations.",
    error="nova_parse_failed",
)


# ──────────────────────────────────────────────
# Main endpoint
# ──────────────────────────────────────────────

@router.post("/audit", response_model=RepoAuditResponse)
async def audit_repo(request: RepoAuditRequest):
    """Audit a public GitHub repository and return a craftsmanship report."""

    # MOCK MODE — return hardcoded data
    if MOCK_MODE:
        return MOCK_RESULT

    # 1. Parse URL
    try:
        owner, repo = parse_github_url(request.github_url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 2. Fetch repo tree
    try:
        file_paths = await fetch_repo_tree(owner, repo)
    except HTTPException:
        raise
    except Exception:
        return RepoAuditResponse(
            error="repo_private",
            summary="This repo is private or doesn't exist. Make it public on GitHub then retry.",
        )

    # 3. Detect tech stack from file tree
    tech_stack = detect_tech_stack(file_paths)

    # 4. Build directory structure string
    dir_structure = "\n".join(file_paths[:100])  # Cap at 100 entries

    # 5. Fetch priority files
    file_contents = await fetch_priority_files(owner, repo, file_paths)
    files_text = ""
    for path, content in file_contents.items():
        files_text += f"\n\n--- FILE: {path} ---\n{content}"

    # 6. Build user message for Nova
    user_message = (
        f"Repository: {owner}/{repo}\n"
        f"Total files: {len(file_paths)}\n"
        f"Detected tech stack: {', '.join(tech_stack)}\n\n"
        f"Directory structure:\n{dir_structure}\n\n"
        f"File contents:{files_text}"
    )

    # 7. Call Nova
    try:
        nova_response = invoke_nova(SYSTEM_PROMPT, user_message)
    except RuntimeError:
        result = DEFAULT_SCORES.model_copy()
        result.tech_stack = tech_stack
        return result

    # 8. Parse Nova JSON response
    try:
        # Clean any markdown formatting Nova might have added
        cleaned = nova_response.strip()
        cleaned = re.sub(r"^```json\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
        parsed = json.loads(cleaned)

        return RepoAuditResponse(
            craftsmanship_score=int(parsed.get("craftsmanship_score", 65)),
            code_quality=int(parsed.get("code_quality", 65)),
            security=int(parsed.get("security", 60)),
            maintainability=int(parsed.get("maintainability", 65)),
            best_practices=int(parsed.get("best_practices", 60)),
            test_coverage_inferred=int(parsed.get("test_coverage_inferred", 40)),
            tech_stack=parsed.get("tech_stack", tech_stack),
            anti_patterns=parsed.get("anti_patterns", [])[:5],
            recommendations=parsed.get("recommendations", [])[:5],
            summary=parsed.get("summary", "Analysis complete."),
        )
    except (json.JSONDecodeError, KeyError, TypeError):
        result = DEFAULT_SCORES.model_copy()
        result.tech_stack = tech_stack
        return result
