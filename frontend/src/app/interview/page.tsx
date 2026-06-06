'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type PageState = 'idle' | 'active' | 'complete';

interface InterviewScore {
  technical_accuracy: number;
  communication_clarity: number;
  problem_solving_framework: number;
  code_realism: number;
  overall: number;
  summary: string;
  improvements: string[];
  mock?: boolean;
  error?: string;
}

const ROLES = [
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack',
  'AIML Engineer',
  'DevOps',
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const METRIC_LABELS: Record<keyof Pick<InterviewScore, 'technical_accuracy' | 'communication_clarity' | 'problem_solving_framework' | 'code_realism'>, string> = {
  technical_accuracy: 'Technical Accuracy',
  communication_clarity: 'Communication',
  problem_solving_framework: 'Problem Solving',
  code_realism: 'Code Realism',
};

// ─────────────────────────────────────────────
// Utility hooks
// ─────────────────────────────────────────────
function useCountUp(target: number, duration = 1500, active = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active || target === 0) return;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setValue(target);
        clearInterval(interval);
      } else {
        setValue(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [target, duration, active]);
  return value;
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function WaveOrb({ seconds }: { seconds: number }) {
  const fmt = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  return (
    <div className="wave-orb-container">
      <svg width="260" height="260" viewBox="0 0 260 260">
        <circle className="orb-ring orb-ring-1" cx="130" cy="130" r="115" />
        <circle className="orb-ring orb-ring-2" cx="130" cy="130" r="90" />
        <circle className="orb-ring orb-ring-3" cx="130" cy="130" r="65" />
        <circle cx="130" cy="130" r="48" fill="#560BAD" opacity="0.9" />
      </svg>
      <div className="orb-timer">{fmt}</div>
    </div>
  );
}

function ScoreCard({
  label,
  value,
  delay,
  active,
}: {
  label: string;
  value: number;
  delay: number;
  active: boolean;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  const displayed = useCountUp(value, 1200, ready && active);
  const color = value > 80 ? '#06d6a0' : value >= 60 ? '#f4a261' : '#e94560';
  const bg = value > 80 ? 'rgba(6,214,160,0.12)' : value >= 60 ? 'rgba(244,162,97,0.12)' : 'rgba(233,69,96,0.12)';
  return (
    <div className="score-card" style={{ background: bg, borderColor: color + '44' }}>
      <div className="score-card-value" style={{ color }}>{displayed}</div>
      <div className="score-card-label">{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function InterviewPage() {
  const [state, setState] = useState<PageState>('idle');
  const [role, setRole] = useState('Full Stack');
  const [difficulty, setDifficulty] = useState('Medium');
  const [seconds, setSeconds] = useState(0);
  const [showSummon, setShowSummon] = useState(false);
  const [ariaVisible, setAriaVisible] = useState(false);
  const [orbFading, setOrbFading] = useState(false);
  const [score, setScore] = useState<InterviewScore | null>(null);
  const [scoreActive, setScoreActive] = useState(false);
  const vapiRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Timer ──
  useEffect(() => {
    if (state === 'active') {
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state]);

  // ── Show "Summon ARIA" toast after 30s ──
  useEffect(() => {
    if (state !== 'active') { setShowSummon(false); return; }
    const t = setTimeout(() => setShowSummon(true), 30_000);
    return () => clearTimeout(t);
  }, [state]);

  // ── Animate scores when complete ──
  useEffect(() => {
    if (state === 'complete') {
      const t = setTimeout(() => setScoreActive(true), 200);
      return () => clearTimeout(t);
    } else {
      setScoreActive(false);
    }
  }, [state]);

  const startInterview = useCallback(async () => {
    setState('active');

    // VAPI integration — only runs in browser with real key
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY) {
      try {
        const { default: Vapi } = await import('@vapi-ai/web');
        vapiRef.current = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);
        vapiRef.current.start({
          assistant: {
            firstMessage: `Hi! I'm ARIA, your AI interview coach. We'll be doing a ${difficulty} ${role} interview today. Ready? Tell me about yourself.`,
            model: {
              provider: 'openai',
              model: 'gpt-4',
              systemPrompt: `You are ARIA, an expert technical interviewer for a ${role} position at ${difficulty} level. Ask relevant questions, evaluate answers, and give constructive feedback. After the interview, thank the candidate.`,
            },
            voice: { provider: 'playht', voiceId: 'jennifer' },
            serverUrl: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/interview/webhook`,
          },
        });
      } catch {
        // VAPI not available — session still works visually
      }
    }
  }, [role, difficulty]);

  const summonAria = () => {
    setOrbFading(true);
    setTimeout(() => setAriaVisible(true), 300);
  };

  const endSession = useCallback(async () => {
    if (vapiRef.current) {
      try { vapiRef.current.stop(); } catch { /* ignore */ }
    }

    // Fetch score from backend (uses mock data if MOCK_MODE)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/interview/score`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: 'Session completed. Scoring based on session duration and activity.',
            role,
            difficulty,
          }),
        }
      );
      if (res.ok) {
        const data: InterviewScore = await res.json();
        setScore(data);
      } else {
        setScore(getMockScore());
      }
    } catch {
      setScore(getMockScore());
    }

    setAriaVisible(false);
    setOrbFading(false);
    setShowSummon(false);
    setState('complete');
  }, [role, difficulty]);

  const reset = () => {
    setScore(null);
    setState('idle');
  };

  const overallDisplay = useCountUp(score?.overall ?? 0, 1500, scoreActive);

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>
      <div className="interview-root">
        {/* ── IDLE ── */}
        {state === 'idle' && (
          <div className="idle-container">
            <div className="idle-header">
              <div className="aria-badge">🎙 ARIA Interview Copilot</div>
              <h1 className="idle-title">Practice Like It's Real</h1>
              <p className="idle-sub">
                AI-powered mock interviews with instant scoring. Train smarter, land the offer.
              </p>
            </div>

            <div className="idle-card">
              <div className="selector-group">
                <label className="selector-label">Role</label>
                <div className="pill-row">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      className={`pill ${role === r ? 'pill-active' : ''}`}
                      onClick={() => setRole(r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="selector-group">
                <label className="selector-label">Difficulty</label>
                <div className="pill-row">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      className={`pill diff-${d.toLowerCase()} ${difficulty === d ? 'pill-active' : ''}`}
                      onClick={() => setDifficulty(d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <button className="start-btn" onClick={startInterview} id="start-interview-btn">
                <span>▶</span> Start Interview
              </button>
            </div>

            <div className="idle-features">
              <div className="feature-chip">⚡ Real-time AI feedback</div>
              <div className="feature-chip">🏆 Score breakdown</div>
              <div className="feature-chip">📈 Track progress</div>
            </div>
          </div>
        )}

        {/* ── ACTIVE ── */}
        {state === 'active' && (
          <div className="active-container">
            <div className="active-header">
              <span className="live-badge">● LIVE</span>
              <span className="session-info">{role} · {difficulty}</span>
            </div>

            <div className={`orb-wrapper ${orbFading ? 'orb-fade-out' : ''}`}>
              <WaveOrb seconds={seconds} />
            </div>

            {ariaVisible && (
              <div className="aria-img-wrapper">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/aria.png" alt="ARIA" className="aria-img" />
              </div>
            )}

            <p className="active-hint">ARIA is listening… speak naturally.</p>

            <div className="active-actions">
              {showSummon && !ariaVisible && (
                <div className="summon-toast">
                  <span>Tired of the orb? 👀</span>
                  <button className="summon-btn" onClick={summonAria}>
                    Summon ARIA →
                  </button>
                </div>
              )}
              <button className="end-btn" onClick={endSession} id="end-session-btn">
                ⏹ End Session
              </button>
            </div>
          </div>
        )}

        {/* ── COMPLETE ── */}
        {state === 'complete' && score && (
          <div className="complete-container">
            <div className="complete-header">
              <div className="complete-badge">✅ Interview Complete</div>
              <h2 className="complete-title">Here&apos;s Your ARIA Analysis</h2>
              {score.mock && (
                <span className="mock-notice">Mock data — connect backend for real scores</span>
              )}
            </div>

            {/* Overall */}
            <div className="overall-ring">
              <svg width="180" height="180" viewBox="0 0 180 180">
                <circle cx="90" cy="90" r="80" fill="none" stroke="#e8d5ff" strokeWidth="14" />
                <circle
                  cx="90"
                  cy="90"
                  r="80"
                  fill="none"
                  stroke="#560BAD"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 80}`}
                  strokeDashoffset={`${2 * Math.PI * 80 * (1 - (score.overall / 100))}`}
                  transform="rotate(-90 90 90)"
                  style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                />
              </svg>
              <div className="overall-center">
                <div className="overall-num">{overallDisplay}</div>
                <div className="overall-label">Overall</div>
              </div>
            </div>

            {/* 4 metric cards */}
            <div className="metric-grid">
              {(Object.keys(METRIC_LABELS) as Array<keyof typeof METRIC_LABELS>).map((key, i) => (
                <ScoreCard
                  key={key}
                  label={METRIC_LABELS[key]}
                  value={score[key]}
                  delay={i * 200}
                  active={scoreActive}
                />
              ))}
            </div>

            {/* Summary */}
            <div className="summary-card">
              <p className="summary-text">{score.summary}</p>
            </div>

            {/* Improvements */}
            <div className="improvements">
              <h3 className="improvements-title">💡 Key Improvements</h3>
              <ul className="improvements-list">
                {score.improvements.map((tip, i) => (
                  <li key={i} className="improvement-item">
                    <span className="improvement-icon">→</span> {tip}
                  </li>
                ))}
              </ul>
            </div>

            <button className="reset-btn" onClick={reset} id="new-session-btn">
              🔄 Start New Session
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Mock fallback
// ─────────────────────────────────────────────
function getMockScore(): InterviewScore {
  return {
    technical_accuracy: 82,
    communication_clarity: 78,
    problem_solving_framework: 85,
    code_realism: 74,
    overall: 80,
    summary: 'Strong fundamentals demonstrated. Improve edge case handling and production thinking for senior roles.',
    improvements: [
      'Always mention time/space complexity upfront',
      'Ask clarifying questions before diving into a solution',
      'Mention error handling in every code example',
      'Discuss testing approach and edge cases explicitly',
    ],
    mock: true,
  };
}

// ─────────────────────────────────────────────
// Inline CSS
// ─────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

.interview-root {
  min-height: 100vh;
  background: radial-gradient(ellipse at top-left, #e8d5ff 0%, #d0f7f0 50%, #f9f9fb 100%);
  font-family: 'Inter', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

/* ── IDLE ── */
.idle-container { display: flex; flex-direction: column; align-items: center; gap: 2rem; max-width: 640px; width: 100%; }
.aria-badge { background: rgba(86,11,173,0.1); color: #560BAD; border: 1px solid rgba(86,11,173,0.2); border-radius: 999px; padding: 0.4rem 1rem; font-size: 0.85rem; font-weight: 600; letter-spacing: 0.05em; }
.idle-header { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
.idle-title { font-size: 2.8rem; font-weight: 800; background: linear-gradient(135deg, #560BAD, #7209B7, #00F5D4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0; line-height: 1.1; }
.idle-sub { color: #555577; font-size: 1.05rem; margin: 0; max-width: 420px; }

.idle-card { background: rgba(255,255,255,0.75); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.4); border-radius: 24px; padding: 2.5rem; box-shadow: 0 20px 60px rgba(86,11,173,0.1); width: 100%; display: flex; flex-direction: column; gap: 1.75rem; }
.selector-group { display: flex; flex-direction: column; gap: 0.75rem; }
.selector-label { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #560BAD; }
.pill-row { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.pill { padding: 0.45rem 1rem; border-radius: 999px; border: 1.5px solid rgba(86,11,173,0.25); background: transparent; color: #555577; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: inherit; }
.pill:hover { border-color: #560BAD; color: #560BAD; background: rgba(86,11,173,0.05); }
.pill-active { background: #560BAD !important; color: white !important; border-color: #560BAD !important; }
.diff-easy { border-color: rgba(6,214,160,0.4); color: #06d6a0; }
.diff-medium { border-color: rgba(244,162,97,0.4); color: #f4a261; }
.diff-hard { border-color: rgba(233,69,96,0.4); color: #e94560; }

.start-btn { width: 100%; padding: 1rem; border-radius: 14px; background: linear-gradient(135deg, #560BAD, #7209B7); color: white; font-size: 1.1rem; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.6rem; transition: all 0.25s; box-shadow: 0 8px 24px rgba(86,11,173,0.35); font-family: inherit; letter-spacing: 0.02em; }
.start-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(86,11,173,0.45); }
.start-btn:active { transform: translateY(0); }

.idle-features { display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center; }
.feature-chip { background: rgba(255,255,255,0.7); border: 1px solid rgba(86,11,173,0.15); border-radius: 999px; padding: 0.4rem 1rem; font-size: 0.8rem; font-weight: 500; color: #555577; }

/* ── ACTIVE ── */
.active-container { display: flex; flex-direction: column; align-items: center; gap: 2rem; }
.active-header { display: flex; align-items: center; gap: 0.75rem; }
.live-badge { background: rgba(6,214,160,0.15); color: #06d6a0; border: 1px solid rgba(6,214,160,0.3); border-radius: 999px; padding: 0.3rem 0.8rem; font-size: 0.8rem; font-weight: 700; animation: pulse-dot 1.5s infinite; }
@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.5} }
.session-info { color: #555577; font-size: 0.9rem; font-weight: 500; }

.orb-wrapper { position: relative; transition: opacity 0.3s ease; }
.orb-fade-out { opacity: 0; }
.wave-orb-container { position: relative; display: flex; align-items: center; justify-content: center; }
.wave-orb-container svg { position: relative; }
.orb-timer { position: absolute; color: white; font-size: 1.5rem; font-weight: 700; font-variant-numeric: tabular-nums; }

.orb-ring { fill: none; stroke: #560BAD; stroke-width: 2; }
.orb-ring-1 { stroke-dasharray: 12 8; animation: spin 8s linear infinite; opacity: 0.35; }
.orb-ring-2 { stroke-dasharray: 8 12; animation: spin 5s linear infinite reverse; opacity: 0.5; }
.orb-ring-3 { stroke-dasharray: 5 5; animation: spin 3s linear infinite; opacity: 0.65; }
@keyframes spin { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -200; } }

.aria-img-wrapper { display: flex; justify-content: center; animation: bounceIn 0.4s ease; }
.aria-img { width: 220px; height: 220px; object-fit: contain; animation: bounce 2s ease-in-out infinite; border-radius: 50%; box-shadow: 0 0 40px rgba(86,11,173,0.4); }
@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
@keyframes bounceIn { from{transform:scale(0.7);opacity:0} to{transform:scale(1);opacity:1} }

.active-hint { color: #888; font-size: 0.9rem; text-align: center; margin: 0; }
.active-actions { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.summon-toast { background: rgba(255,255,255,0.9); backdrop-filter: blur(12px); border: 1px solid rgba(86,11,173,0.2); border-radius: 14px; padding: 0.9rem 1.4rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 8px 24px rgba(0,0,0,0.08); animation: slide-up 0.3s ease; font-size: 0.9rem; color: #333; }
@keyframes slide-up { from{transform:translateY(12px);opacity:0} to{transform:translateY(0);opacity:1} }
.summon-btn { background: linear-gradient(135deg, #560BAD, #7209B7); color: white; border: none; border-radius: 999px; padding: 0.4rem 1rem; font-size: 0.85rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: transform 0.2s; }
.summon-btn:hover { transform: scale(1.05); }
.end-btn { padding: 0.8rem 2.5rem; border-radius: 12px; background: rgba(233,69,96,0.1); color: #e94560; border: 1.5px solid rgba(233,69,96,0.3); font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit; }
.end-btn:hover { background: rgba(233,69,96,0.18); }

/* ── COMPLETE ── */
.complete-container { display: flex; flex-direction: column; align-items: center; gap: 1.75rem; max-width: 680px; width: 100%; }
.complete-header { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.complete-badge { background: rgba(6,214,160,0.12); color: #06d6a0; border: 1px solid rgba(6,214,160,0.3); border-radius: 999px; padding: 0.35rem 0.9rem; font-size: 0.8rem; font-weight: 700; }
.complete-title { font-size: 2rem; font-weight: 800; background: linear-gradient(135deg, #560BAD, #7209B7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0; }
.mock-notice { font-size: 0.75rem; color: #f4a261; background: rgba(244,162,97,0.1); border: 1px solid rgba(244,162,97,0.3); border-radius: 999px; padding: 0.2rem 0.75rem; }

.overall-ring { position: relative; display: flex; align-items: center; justify-content: center; }
.overall-center { position: absolute; text-align: center; }
.overall-num { font-size: 2.8rem; font-weight: 800; color: #560BAD; line-height: 1; font-variant-numeric: tabular-nums; }
.overall-label { font-size: 0.75rem; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.1em; }

.metric-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; width: 100%; }
.score-card { border-radius: 16px; padding: 1.5rem; border: 1.5px solid; text-align: center; transition: transform 0.2s; }
.score-card:hover { transform: translateY(-2px); }
.score-card-value { font-size: 2.2rem; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1; }
.score-card-label { font-size: 0.8rem; font-weight: 600; color: #555577; margin-top: 0.3rem; text-transform: uppercase; letter-spacing: 0.06em; }

.summary-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.4); border-radius: 16px; padding: 1.5rem 2rem; width: 100%; box-sizing: border-box; }
.summary-text { margin: 0; color: #333; line-height: 1.65; font-size: 0.95rem; text-align: center; }

.improvements { background: rgba(255,255,255,0.6); backdrop-filter: blur(12px); border: 1px solid rgba(86,11,173,0.12); border-radius: 16px; padding: 1.5rem 2rem; width: 100%; box-sizing: border-box; }
.improvements-title { margin: 0 0 1rem; font-size: 1rem; font-weight: 700; color: #560BAD; }
.improvements-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.6rem; }
.improvement-item { font-size: 0.9rem; color: #444; display: flex; align-items: flex-start; gap: 0.5rem; line-height: 1.5; }
.improvement-icon { color: #560BAD; font-weight: 700; flex-shrink: 0; margin-top: 1px; }

.reset-btn { padding: 0.9rem 2.5rem; border-radius: 14px; background: linear-gradient(135deg, #560BAD, #7209B7); color: white; font-size: 1rem; font-weight: 700; border: none; cursor: pointer; transition: all 0.25s; box-shadow: 0 8px 24px rgba(86,11,173,0.3); font-family: inherit; }
.reset-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(86,11,173,0.4); }

@media (max-width: 480px) {
  .idle-title { font-size: 2rem; }
  .metric-grid { grid-template-columns: 1fr; }
  .pill-row { gap: 0.4rem; }
}
`;
