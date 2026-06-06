"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ScoreRing from "@/components/ScoreRing";
import SkillBadge from "@/components/SkillBadge";
import {
  LayoutDashboard,
  Mic,
  Code2,
  FileText,
  Target,
  Map,
  BarChart3,
  Bookmark,
  Settings,
  Bell,
  X,
  Lightbulb,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
      }
    };
    checkUser();

    const toastTimer = setTimeout(() => {
      setShowToast(true);
    }, 10000);

    return () => clearTimeout(toastTimer);
  }, [router]);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-animate">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[var(--accent)]/20 mb-4" />
          <div className="h-4 w-32 bg-[var(--accent)]/10 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-animate">
      {/* LEFT SIDEBAR */}
      <aside className="w-60 h-full bg-white/60 backdrop-blur-md border-r border-white/30 flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-black text-[var(--accent)] tracking-tighter">
            ARIA+
          </h2>
          <p className="text-xs text-text-secondary mt-1 font-medium tracking-wide">
            AI CAREER COPILOT
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#560BAD]/10 text-[#560BAD] font-semibold text-sm transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link
            href="/interview"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:bg-white/50 hover:text-text font-medium text-sm transition-colors"
          >
            <Mic className="w-5 h-5" /> Interview Copilot
          </Link>
          <Link
            href="/repo"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:bg-white/50 hover:text-text font-medium text-sm transition-colors"
          >
            <Code2 className="w-5 h-5" /> GitHub Auditor
          </Link>
          <Link
            href="/resume"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:bg-white/50 hover:text-text font-medium text-sm transition-colors"
          >
            <FileText className="w-5 h-5" /> Resume Analyzer
          </Link>
          <Link
            href="/jobs"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:bg-white/50 hover:text-text font-medium text-sm transition-colors"
          >
            <Target className="w-5 h-5" /> Job Tracker
          </Link>
          <div className="h-4" />
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:bg-white/50 hover:text-text font-medium text-sm transition-colors"
          >
            <Map className="w-5 h-5" /> Roadmap
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:bg-white/50 hover:text-text font-medium text-sm transition-colors"
          >
            <BarChart3 className="w-5 h-5" /> Analytics
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:bg-white/50 hover:text-text font-medium text-sm transition-colors"
          >
            <Bookmark className="w-5 h-5" /> Saved
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:bg-white/50 hover:text-text font-medium text-sm transition-colors"
          >
            <Settings className="w-5 h-5" /> Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-white/30">
          <div className="bg-white/50 rounded-xl p-4 shadow-sm border border-white/40">
            <div className="text-sm font-bold flex items-center gap-1.5">
              ⭐ Free Plan
            </div>
            <div className="text-xs text-text-secondary mt-1">
              8450/10000 cr
            </div>
            <div className="progress-bar mt-2 bg-black/5">
              <div
                className="progress-bar-fill bg-[var(--accent)]"
                style={{ width: "84.5%" }}
              />
            </div>
            <button className="w-full mt-3 text-xs font-bold text-[var(--accent)] hover:bg-[var(--accent)]/10 py-1.5 rounded-lg transition-colors">
              Manage Plan
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <main className="flex-1 overflow-y-auto flex flex-col h-full relative">
        <div className="p-8 pb-24 flex-1">
          {/* Top Bar */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back, {user.user_metadata?.full_name?.split(" ")[0] || "User"} 👋
              </h1>
              <p className="text-text-secondary mt-1">
                Your AI copilot is ready to accelerate your career journey.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="btn-primary py-2 px-4 text-sm flex items-center gap-1">
                ⚡ Upgrade Plan
              </button>
              <button className="relative p-2 bg-white/50 rounded-full hover:bg-white border border-white/40 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[var(--danger)] rounded-full border-2 border-[#f3eefe]" />
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--mint)] p-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    user.user_metadata?.avatar_url ||
                    "https://api.dicebear.com/7.x/notionists/svg?seed=Felix"
                  }
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover bg-white"
                />
              </div>
            </div>
          </div>

          {/* 4 FEATURE CARDS */}
          <div className="grid grid-cols-2 gap-6">
            {/* Card 1: Interview */}
            <div className="glass-card p-6 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2">
                  <Mic className="w-5 h-5 text-[var(--accent)]" />
                  <h3 className="font-bold text-lg">Live Interview Room</h3>
                </div>
                <Link
                  href="/interview"
                  className="text-sm font-semibold text-[var(--accent)] hover:underline"
                >
                  Join Room →
                </Link>
              </div>
              <div className="flex-1 flex items-center justify-center mb-6 min-h-[140px]">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 border-2 border-[var(--accent)] rounded-full wave-ring-1" />
                  <div className="absolute inset-2 border-2 border-[var(--mint)] rounded-full wave-ring-2" />
                  <div className="absolute inset-4 border-2 border-[#b5179e] rounded-full wave-ring-3" />
                  <Mic className="w-6 h-6 text-[var(--accent)] relative z-10" />
                </div>
              </div>
              <div className="bg-white/50 rounded-xl p-3 border border-white/40 mt-auto">
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-semibold">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Clarity</span>
                    <span className="text-[var(--success)]">92%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Confidence</span>
                    <span className="text-[var(--success)]">87%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Structure</span>
                    <span className="text-[var(--success)]">89%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Relevance</span>
                    <span className="text-[var(--mint)]">94%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: GitHub Auditor */}
            <div className="glass-card p-6 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-[var(--mint)]" />
                  <h3 className="font-bold text-lg">GitHub Repo Auditor</h3>
                </div>
                <Link
                  href="/repo"
                  className="text-sm font-semibold text-[var(--accent)] hover:underline"
                >
                  Scan New Repo →
                </Link>
              </div>
              <div className="flex-1 flex items-center gap-6">
                <ScoreRing score={84} color="mint" label="Trust Score" />
                <div className="flex-1 grid grid-cols-2 gap-3 text-xs font-bold">
                  <div>
                    <div className="text-text-secondary font-medium">Quality</div>
                    <div className="text-lg">92%</div>
                  </div>
                  <div>
                    <div className="text-text-secondary font-medium">Security</div>
                    <div className="text-lg">88%</div>
                  </div>
                  <div>
                    <div className="text-text-secondary font-medium">Maint.</div>
                    <div className="text-lg">90%</div>
                  </div>
                  <div>
                    <div className="text-text-secondary font-medium">Tests</div>
                    <div className="text-lg text-[var(--warning)]">76%</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs mt-6 text-text-secondary font-medium">
                <span>Last scanned: 2 hours ago</span>
                <Link href="/repo" className="hover:text-[var(--accent)]">
                  View Full Report →
                </Link>
              </div>
            </div>

            {/* Card 3: Resume Analysis */}
            <div className="glass-card p-6 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#f72585]" />
                  <h3 className="font-bold text-lg">Resume RAG Analysis</h3>
                </div>
                <Link
                  href="/resume"
                  className="text-sm font-semibold text-[var(--accent)] hover:underline"
                >
                  Re-analyze →
                </Link>
              </div>
              <div className="flex-1 flex items-center gap-6">
                <ScoreRing score={94} color="var(--accent)" label="Match Score" />
                <div className="flex-1 flex flex-wrap gap-2">
                  <SkillBadge skill="TypeScript" type="matched" />
                  <SkillBadge skill="React" type="matched" />
                  <SkillBadge skill="Node.js" type="matched" />
                  <SkillBadge skill="AWS" type="matched" />
                  <SkillBadge skill="GraphQL" type="missing" />
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span>ATS Compatibility</span>
                  <span className="text-[var(--success)]">96%</span>
                </div>
                <div className="progress-bar bg-black/5">
                  <div
                    className="progress-bar-fill bg-[var(--success)]"
                    style={{ width: "96%" }}
                  />
                </div>
                <span className="text-xs text-[var(--accent)] font-semibold mt-1">
                  7 Improvement Suggestions
                </span>
              </div>
            </div>

            {/* Card 4: Fake Job Tracking */}
            <div className="glass-card p-6 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-[var(--danger)]" />
                  <h3 className="font-bold text-lg">Fake Job Tracking</h3>
                </div>
                <Link
                  href="/jobs"
                  className="text-sm font-semibold text-[var(--accent)] hover:underline"
                >
                  Scan New Job →
                </Link>
              </div>
              <div className="flex-1 flex items-center gap-6">
                <ScoreRing score={32} color="danger" label="Fake Score" />
                <div className="flex-1 text-sm">
                  <div className="font-bold">Senior Frontend Eng.</div>
                  <div className="text-text-secondary mt-0.5">Stripe · Remote</div>
                  <div className="mt-3 text-xs bg-white/60 p-2 rounded-lg border border-white/50">
                    <span className="text-text-secondary">Risk Factors:</span>{" "}
                    <span className="font-bold">2/10</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 font-bold text-sm text-[var(--success)] flex items-center gap-2">
                ✓ This job looks mostly legitimate.
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM STATS BAR */}
        <div className="absolute bottom-0 left-0 w-full glass-card border-x-0 border-b-0 rounded-b-none p-4 grid grid-cols-4 divide-x divide-white/40">
          <div className="px-6 flex flex-col justify-center">
            <span className="text-xs font-bold text-[var(--accent)] mb-1 uppercase tracking-wider">
              Pro Tip 💡
            </span>
            <span className="text-sm font-medium text-text-secondary">
              Update your GitHub before an interview.
            </span>
          </div>
          <div className="px-6 flex flex-col justify-center">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="uppercase tracking-wider">Weekly Goal</span>
              <span className="text-[var(--accent)]">4 / 5</span>
            </div>
            <div className="progress-bar bg-black/5 h-2">
              <div
                className="progress-bar-fill bg-[var(--accent)]"
                style={{ width: "80%" }}
              />
            </div>
          </div>
          <div className="px-6 flex flex-col justify-center">
            <span className="text-xs font-bold mb-2 uppercase tracking-wider">
              Skills in Focus
            </span>
            <div className="flex gap-2">
              <span className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xs">
                TS
              </span>
              <span className="w-6 h-6 rounded-md bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold text-xs">
                Re
              </span>
              <span className="w-6 h-6 rounded-md bg-yellow-500/10 text-yellow-600 flex items-center justify-center font-bold text-xs">
                JS
              </span>
              <span className="w-6 h-6 rounded-md bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold text-xs">
                AW
              </span>
            </div>
          </div>
          <div className="px-6 flex flex-col justify-center">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="uppercase tracking-wider">Career Progress</span>
              <span className="text-[var(--warning)]">Level 12</span>
            </div>
            <div className="progress-bar bg-black/5 h-2">
              <div
                className="progress-bar-fill bg-[var(--warning)]"
                style={{ width: "65%" }}
              />
            </div>
            <span className="text-[10px] text-text-secondary font-medium mt-1 text-right">
              3,240 / 5,000 XP
            </span>
          </div>
        </div>
      </main>

      {/* FLOATING TOAST */}
      {showToast && (
        <div className="fixed bottom-24 right-6 bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-4 border border-white/50 flex items-center gap-3 z-50 animate-slide-in-right max-w-sm">
          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
            <Lightbulb className="w-4 h-4 text-yellow-600" />
          </div>
          <p className="text-sm font-medium text-text">
            <span className="font-bold">Tip:</span> Scan your GitHub first for a smarter interview experience!
          </p>
          <button
            onClick={() => setShowToast(false)}
            className="p-1 hover:bg-black/5 rounded-md shrink-0 ml-1 transition-colors"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
      )}
    </div>
  );
}
