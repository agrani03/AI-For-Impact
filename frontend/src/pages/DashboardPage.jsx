import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  LogOut, ShieldAlert, FileText, Code2, 
  Mic, Trophy, ChevronRight, Activity, Bell 
} from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Auth Check
    const checkUser = async () => {
      if (localStorage.getItem('devBypass') === 'true') {
        setUser({
          email: 'local.dev@example.com',
          user_metadata: { full_name: 'Dev Hacker' }
        })
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
      } else {
        navigate('/login')
      }
    }
    checkUser()

    // Slide-in toast
    const t = setTimeout(() => setShowToast(true), 1500)
    return () => clearTimeout(t)
  }, [navigate])

  const handleSignOut = async () => {
    localStorage.removeItem('devBypass')
    await supabase.auth.signOut()
    navigate('/')
  }

  if (!user) return null

  return (
    <div className="min-h-screen flex bg-gradient-animate">
      
      {/* ── SIDEBAR ── */}
      <aside className="w-72 bg-white/60 backdrop-blur-xl border-r border-white/40 flex flex-col p-6 shadow-2xl shadow-[#560BAD]/5">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#560BAD] to-[#00F5D4] shadow-lg shadow-[#00F5D4]/30" />
          <div className="text-2xl font-black text-[#560BAD] tracking-tighter">ARIA+</div>
        </div>

        <nav className="flex-1 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#560BAD]/10 text-[#560BAD] font-bold">
            <Activity className="w-5 h-5" /> Dashboard
          </Link>
          <Link to="/interview" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#555577] hover:bg-white/50 font-semibold transition-colors">
            <Mic className="w-5 h-5" /> Mock Interview
          </Link>
          <Link to="/repo" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#555577] hover:bg-white/50 font-semibold transition-colors">
            <Code2 className="w-5 h-5" /> Repo Auditor
          </Link>
          <Link to="/resume" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#555577] hover:bg-white/50 font-semibold transition-colors">
            <FileText className="w-5 h-5" /> Resume RAG
          </Link>
          <button disabled className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 font-semibold cursor-not-allowed">
            <ShieldAlert className="w-5 h-5" /> Scam Detector
          </button>
        </nav>

        {/* User Card */}
        <div className="mt-auto glass-card p-4 flex items-center gap-3">
          <img src={user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.email}`} 
               alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold truncate">{user.user_metadata.full_name || user.email}</div>
            <div className="text-xs text-[#555577] truncate">Pro Member</div>
          </div>
          <button onClick={handleSignOut} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 p-10 flex flex-col h-screen overflow-y-auto">
        
        {/* Header */}
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black mb-2">Welcome back, {user.user_metadata.full_name?.split(' ')[0] || 'User'}! 👋</h1>
            <p className="text-[#555577] font-medium">Your career readiness score is looking great today.</p>
          </div>
          <button className="glass-card p-3 rounded-full relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#e94560] rounded-full animate-pulse" />
          </button>
        </header>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8 flex-1">
          
          {/* Card 1: Interview */}
          <div className="glass-card p-8 group relative overflow-hidden flex flex-col">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#00F5D4]/10 rounded-full blur-3xl group-hover:bg-[#00F5D4]/20 transition-all" />
            <div className="w-14 h-14 rounded-2xl bg-[#00F5D4]/20 text-[#06d6a0] flex items-center justify-center mb-6">
              <Mic className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Practice Interview</h2>
            <p className="text-[#555577] mb-8 flex-1">Face off against ARIA in a real-time voice interview tailored to your target role.</p>
            <Link to="/interview" className="btn-primary w-max flex items-center gap-2 group-hover:scale-105">
              Start Session <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Repo Auditor */}
          <div className="glass-card p-8 group relative overflow-hidden flex flex-col">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#560BAD]/10 rounded-full blur-3xl group-hover:bg-[#560BAD]/20 transition-all" />
            <div className="w-14 h-14 rounded-2xl bg-[#560BAD]/10 text-[#560BAD] flex items-center justify-center mb-6">
              <Code2 className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Audit GitHub Repo</h2>
            <p className="text-[#555577] mb-8 flex-1">Scan your code for anti-patterns, security flaws, and overall craftsmanship.</p>
            <Link to="/repo" className="btn-primary w-max flex items-center gap-2 group-hover:scale-105" style={{ background: '#560BAD' }}>
              Scan Code <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 3: Resume RAG */}
          <div className="glass-card p-8 group relative overflow-hidden flex flex-col">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#f72585]/10 rounded-full blur-3xl group-hover:bg-[#f72585]/20 transition-all" />
            <div className="w-14 h-14 rounded-2xl bg-[#f72585]/10 text-[#f72585] flex items-center justify-center mb-6">
              <FileText className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Resume RAG</h2>
            <p className="text-[#555577] mb-8 flex-1">Compare your resume against live job descriptions to find missing keywords.</p>
            <Link to="/resume" className="btn-primary w-max flex items-center gap-2 group-hover:scale-105" style={{ background: '#f72585' }}>
              Analyze Resume <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 4: Scam Detector */}
          <div className="glass-card p-8 group relative overflow-hidden flex flex-col opacity-60">
            <div className="absolute right-4 top-4 bg-gray-200 text-gray-500 text-xs font-bold px-3 py-1 rounded-full">Coming Soon</div>
            <div className="w-14 h-14 rounded-2xl bg-[#e94560]/10 text-[#e94560] flex items-center justify-center mb-6">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Job Scam Detector</h2>
            <p className="text-[#555577] mb-8 flex-1">Paste a job URL and let ARIA detect red flags and verify company legitimacy.</p>
            <button disabled className="btn-primary w-max bg-gray-300 cursor-not-allowed">
              Locked
            </button>
          </div>

        </div>

        {/* Bottom Stats Bar */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#555577]">Current Streak</div>
              <div className="text-xl font-black">4 Days</div>
            </div>
          </div>
          <div className="h-10 w-px bg-gray-200" />
          <div>
            <div className="text-sm font-bold text-[#555577]">Interviews Completed</div>
            <div className="text-xl font-black">12</div>
          </div>
          <div className="h-10 w-px bg-gray-200" />
          <div>
            <div className="text-sm font-bold text-[#555577]">Avg Code Score</div>
            <div className="text-xl font-black text-[#06d6a0]">88/100</div>
          </div>
        </div>
      </main>

      {/* Floating Toast Notification */}
      {showToast && (
        <div className="fixed bottom-10 right-10 glass-card p-4 flex items-center gap-4 animate-slide-in-right z-50 shadow-2xl">
          <div className="w-10 h-10 rounded-full bg-[#00F5D4]/20 flex items-center justify-center">
            <span className="text-xl">🚀</span>
          </div>
          <div className="pr-4">
            <div className="text-sm font-bold">New feature unlocked!</div>
            <div className="text-xs text-[#555577]">Your interview limit was increased.</div>
          </div>
          <button onClick={() => setShowToast(false)} className="text-gray-400 hover:text-gray-700">✕</button>
        </div>
      )}
    </div>
  )
}
