"use client";

import { useState, useEffect } from "react";
import ScoreRing from "@/components/ScoreRing";

/* ── Types ── */
interface AuditResult {
  craftsmanship_score: number;
  code_quality: number;
  security: number;
  maintainability: number;
  best_practices: number;
  test_coverage_inferred: number;
  tech_stack: string[];
  anti_patterns: string[];
  recommendations: string[];
  summary: string;
  error?: string;
}

/* ── Loading step labels ── */
const SCAN_STEPS = [
  "Fetching file tree…",
  "Reading core files…",
  "Analyzing patterns…",
  "Generating report…",
];

export default function RepoAuditorPage() {
  const [state, setState] = useState<"idle" | "loading" | "result" | "error">("idle");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeStep, setActiveStep] = useState(0);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  /* ── Simulated progress steps ── */
  useEffect(() => {
    if (state !== "loading") return;
    setActiveStep(0);
    const timers: NodeJS.Timeout[] = [];
    SCAN_STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setActiveStep(i), i * 1200));
    });
    return () => timers.forEach(clearTimeout);
  }, [state]);

  /* ── Submit handler ── */
  const handleScan = async () => {
    if (!url.trim()) return;
    setState("loading");
    setResult(null);
    setErrorMsg("");

    try {
      const res = await fetch(`${API}/repo/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ github_url: url.trim() }),
      });

      if (res.status === 404) {
        setErrorMsg("This repo is private or doesn't exist. Make it public on GitHub then retry.");
        setState("error");
        return;
      }
      if (res.status === 429) {
        setErrorMsg("GitHub API rate limit hit. Try again in a minute.");
        setState("error");
        return;
      }
      if (!res.ok) {
        setErrorMsg("Something went wrong. Please check the URL and try again.");
        setState("error");
        return;
      }

      const data: AuditResult = await res.json();
      if (data.error === "repo_private") {
        setErrorMsg(data.summary || "This repo is private or doesn't exist.");
        setState("error");
        return;
      }
      setResult(data);
      setState("result");
    } catch {
      setErrorMsg("Could not reach the server. Is the backend running?");
      setState("error");
    }
  };

  /* ── Score color helper ── */
  const scoreColor = (s: number) =>
    s > 80 ? "var(--success)" : s >= 60 ? "var(--warning)" : "var(--danger)";
  const scoreLabel = (s: number) =>
    s > 80 ? "Excellent" : s >= 60 ? "Good" : "Needs Work";
  const scoreBg = (s: number) =>
    s > 80
      ? "rgba(6,214,160,0.10)"
      : s >= 60
      ? "rgba(244,162,97,0.10)"
      : "rgba(233,69,96,0.10)";

  /* ────────────────────────────────────────────
     IDLE STATE
  ──────────────────────────────────────────── */
  if (state === "idle") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-card p-10 w-full max-w-xl text-center">
          {/* Icon */}
          <div
            className="mx-auto mb-5 w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(86,11,173,0.10)" }}
          >
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>

          <h1 className="text-3xl font-extrabold mb-2" style={{ color: "var(--text)" }}>
            GitHub Repo Auditor
          </h1>
          <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
            ARIA reads your code like a senior engineer would.
          </p>

          {/* URL input */}
          <div className="flex gap-3 mb-4">
            <input
              id="repo-url-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
              placeholder="https://github.com/username/repo"
              className="flex-1 px-4 py-3 rounded-xl border outline-none transition-all text-sm"
              style={{
                background: "rgba(255,255,255,0.6)",
                borderColor: "rgba(255,255,255,0.4)",
              }}
            />
            <button
              id="scan-button"
              onClick={handleScan}
              disabled={!url.trim()}
              className="btn-primary px-6 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              🔍 Scan
            </button>
          </div>

          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            ℹ️ Works with public repos only.
          </p>

          {/* Example repos */}
          <div className="mt-8 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.3)" }}>
            <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
              TRY THESE EXAMPLES
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "facebook/react",
                "vercel/next.js",
                "fastapi/fastapi",
              ].map((repo) => (
                <button
                  key={repo}
                  onClick={() => setUrl(`https://github.com/${repo}`)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                  style={{
                    background: "rgba(86,11,173,0.08)",
                    color: "var(--accent)",
                  }}
                >
                  {repo}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────
     LOADING STATE
  ──────────────────────────────────────────── */
  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-card p-10 w-full max-w-md text-center">
          {/* Spinning icon */}
          <div className="mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center animate-pulse"
            style={{ background: "rgba(86,11,173,0.10)" }}
          >
            <svg className="animate-spin" width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>

          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>
            Scanning Repository…
          </h2>
          <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
            {url.replace("https://github.com/", "")}
          </p>

          {/* Progress steps */}
          <div className="text-left space-y-3">
            {SCAN_STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500"
                  style={{
                    background: i <= activeStep ? "var(--accent)" : "#e8e8f0",
                    color: i <= activeStep ? "#fff" : "var(--text-secondary)",
                  }}
                >
                  {i < activeStep ? "✓" : i + 1}
                </div>
                <span
                  className="text-sm transition-all duration-500"
                  style={{
                    color: i <= activeStep ? "var(--text)" : "var(--text-secondary)",
                    fontWeight: i === activeStep ? 600 : 400,
                  }}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────
     ERROR STATE
  ──────────────────────────────────────────── */
  if (state === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-card p-10 w-full max-w-md text-center">
          <div
            className="mx-auto mb-5 w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(233,69,96,0.10)" }}
          >
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-xl font-bold mb-3" style={{ color: "var(--danger)" }}>
            Could Not Scan Repository
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            {errorMsg}
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setState("idle")} className="btn-primary px-6 py-3 text-sm">
              ← Try Another Repo
            </button>
            <a
              href="https://github.com/settings/repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost px-5 py-3 text-sm"
            >
              Open GitHub Settings ↗
            </a>
          </div>
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────
     RESULT STATE
  ──────────────────────────────────────────── */
  if (state === "result" && result) {
    const scores = [
      { label: "Craftsmanship", value: result.craftsmanship_score, key: "craft" },
      { label: "Code Quality", value: result.code_quality, key: "quality" },
      { label: "Security", value: result.security, key: "security" },
      { label: "Maintainability", value: result.maintainability, key: "maintain" },
      { label: "Best Practices", value: result.best_practices, key: "practices" },
      { label: "Test Coverage", value: result.test_coverage_inferred, key: "tests" },
    ];

    return (
      <div className="min-h-screen p-6 md:p-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: "var(--text)" }}>
              📊 Audit Report
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {url.replace("https://github.com/", "")}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setState("idle")} className="btn-ghost px-5 py-2.5 text-sm">
              Scan Another
            </button>
          </div>
        </div>

        {/* Overall Score + Summary */}
        <div className="glass-card p-8 mb-6 flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <ScoreRing
              score={result.craftsmanship_score}
              size={160}
              color={scoreColor(result.craftsmanship_score)}
              label="Overall"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: scoreBg(result.craftsmanship_score),
                  color: scoreColor(result.craftsmanship_score),
                }}
              >
                {scoreLabel(result.craftsmanship_score)}
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {result.summary}
            </p>
            {/* Tech stack */}
            {result.tech_stack.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {result.tech_stack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: "rgba(86,11,173,0.08)",
                      color: "var(--accent)",
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 6 Score Cards — 3×2 grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {scores.map(({ label, value, key }) => (
            <div key={key} className="glass-card p-5 text-center">
              <div className="relative flex justify-center mb-2">
                <ScoreRing
                  score={value}
                  size={90}
                  color={scoreColor(value)}
                />
              </div>
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                {label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: scoreColor(value) }}>
                {scoreLabel(value)}
              </p>
            </div>
          ))}
        </div>

        {/* Anti-patterns + Recommendations */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Anti-patterns */}
          {result.anti_patterns.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: "var(--danger)" }}>
                <span>⚠️</span> Anti-Patterns Found
              </h3>
              <ul className="space-y-2.5">
                {result.anti_patterns.map((ap, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <span className="mt-0.5 text-xs" style={{ color: "var(--warning)" }}>●</span>
                    {ap}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: "var(--accent)" }}>
                <span>💡</span> Recommendations
              </h3>
              <ul className="space-y-2.5">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <span className="mt-0.5 text-xs" style={{ color: "var(--success)" }}>●</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
