import Link from "next/link";
import { Mic, Code2, FileText, Target, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-animate overflow-x-hidden flex flex-col">
      {/* 1. NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-black text-[var(--accent)] tracking-tighter">
            ARIA+
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-semibold text-text-secondary">
            <Link href="#features" className="hover:text-[var(--accent)] transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-[var(--accent)] transition-colors">How it Works</Link>
            <Link href="#pricing" className="hover:text-[var(--accent)] transition-colors">Pricing</Link>
            <Link href="#" className="hover:text-[var(--accent)] transition-colors">Resources ▾</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-text hover:text-[var(--accent)] transition-colors">
              Log in
            </Link>
            <Link href="/login" className="btn-primary flex items-center gap-2">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. HERO */}
        <section className="pt-24 pb-32 px-6">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            {/* Left Col */}
            <div className="flex-1 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 bg-white/60 border border-[var(--accent)]/20 px-4 py-2 rounded-full text-xs font-bold text-[var(--accent)] tracking-widest mb-8">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                AI CAREER COPILOT FOR TECH PROFESSIONALS
              </div>
              <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
                Want to land your <br className="hidden md:block" />
                <span className="gradient-text">dream tech job?</span>
              </h1>
              <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
                ARIA is your AI-powered career copilot. From resume to offer — we&apos;ve got you. Practice interviews, audit your GitHub, and spot fake jobs in seconds.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
                <Link href="/login" className="btn-primary w-full sm:w-auto text-lg py-4 px-8">
                  Get Started Free →
                </Link>
                <button className="btn-ghost w-full sm:w-auto text-lg py-4 px-8 flex items-center justify-center gap-2 bg-white/50 backdrop-blur-sm">
                  ▶ See How It Works
                </button>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-4">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i}`} alt="user" />
                    </div>
                  ))}
                </div>
                <div className="text-sm font-semibold">
                  <div className="flex text-yellow-400 text-lg">★★★★★</div>
                  <span className="text-text-secondary">Loved by 25,000+ pros</span>
                </div>
              </div>
            </div>

            {/* Right Col */}
            <div className="flex-1 relative w-full max-w-lg lg:max-w-none h-[500px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent)]/10 to-[var(--mint)]/20 rounded-[3rem] blur-3xl" />
              
              {/* ARIA Placeholder */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 bg-white/90 rounded-3xl shadow-2xl border border-white/50 flex flex-col items-center justify-center animate-float z-20">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--accent)] to-[var(--mint)] rounded-full mb-4 animate-pulse" />
                <div className="font-black text-xl tracking-widest text-[var(--accent)]">ARIA</div>
              </div>

              {/* Stat Cards */}
              <div className="absolute top-10 right-0 lg:-right-10 glass-card p-4 flex items-center gap-4 z-30 animate-float" style={{ animationDelay: "0.5s" }}>
                <div className="w-12 h-12 rounded-full border-4 border-[var(--mint)] flex items-center justify-center font-bold text-[var(--mint)]">92%</div>
                <div>
                  <div className="text-xs font-bold text-text-secondary">Career Match</div>
                  <div className="font-bold text-sm">Excellent</div>
                </div>
              </div>

              <div className="absolute bottom-20 left-0 lg:-left-10 glass-card p-4 z-30 animate-float" style={{ animationDelay: "1s" }}>
                <div className="text-xs font-bold text-text-secondary mb-2">Job Opportunities</div>
                <div className="flex items-end gap-2">
                  <div className="text-3xl font-black text-[var(--accent)]">28</div>
                  <div className="text-xs font-bold text-[var(--success)] pb-1">High Match</div>
                </div>
              </div>

              <div className="absolute -bottom-10 right-10 glass-card p-4 z-30 animate-float" style={{ animationDelay: "1.5s" }}>
                <div className="text-xs font-bold text-text-secondary mb-2">Interview Prep</div>
                <div className="flex items-center gap-3">
                  <div className="text-xl font-black text-[var(--accent)]">85%</div>
                  <div className="text-xs font-bold bg-[var(--success)]/10 text-[var(--success)] px-2 py-1 rounded">High Confidence</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. FEATURES */}
        <section id="features" className="py-24 bg-white/40">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-black text-center mb-16">Everything you need to get hired</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="glass-card p-8 group hover:bg-white/80 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-[var(--mint)]/20 text-[var(--success)] flex items-center justify-center mb-6">
                  <Mic className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-3">AI Interview Coach</h3>
                <p className="text-text-secondary leading-relaxed mb-6">Real-time mock interviews with smart scoring and ARIA avatar. Practice your behavioral and technical questions in a stress-free environment.</p>
                <Link href="/interview" className="text-[var(--accent)] font-bold flex items-center gap-2 group-hover:gap-3 transition-all">Explore Feature <ArrowRight className="w-4 h-4" /></Link>
              </div>

              <div className="glass-card p-8 group hover:bg-white/80 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mb-6">
                  <Code2 className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-3">GitHub Repo Auditor</h3>
                <p className="text-text-secondary leading-relaxed mb-6">Deep code analysis — architecture, hygiene, and craftsmanship score. Know exactly what recruiters see when they look at your projects.</p>
                <Link href="/repo" className="text-[var(--accent)] font-bold flex items-center gap-2 group-hover:gap-3 transition-all">Explore Feature <ArrowRight className="w-4 h-4" /></Link>
              </div>

              <div className="glass-card p-8 group hover:bg-white/80 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-[#f72585]/10 text-[#f72585] flex items-center justify-center mb-6">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Resume RAG Analyzer</h3>
                <p className="text-text-secondary leading-relaxed mb-6">Match your resume to live market demands. Find your skill gaps before you apply. Beat the ATS systems with targeted improvements.</p>
                <Link href="/resume" className="text-[var(--accent)] font-bold flex items-center gap-2 group-hover:gap-3 transition-all">Explore Feature <ArrowRight className="w-4 h-4" /></Link>
              </div>

              <div className="glass-card p-8 group hover:bg-white/80 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-[var(--danger)]/10 text-[var(--danger)] flex items-center justify-center mb-6">
                  <Target className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Job Scam Detector</h3>
                <p className="text-text-secondary leading-relaxed mb-6">Verify any job posting before you apply. Never get scammed again. ARIA checks over 20+ risk factors to ensure a job is legitimate.</p>
                <Link href="/jobs" className="text-[var(--accent)] font-bold flex items-center gap-2 group-hover:gap-3 transition-all">Explore Feature <ArrowRight className="w-4 h-4" /></Link>
              </div>
            </div>
          </div>
        </section>

        {/* 4. HOW IT WORKS */}
        <section id="how-it-works" className="py-24">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-black mb-16">Your path to the offer letter</h2>
            <div className="flex flex-col md:flex-row items-center justify-between relative">
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-[var(--accent)]/10 -translate-y-1/2 z-0" />
              
              <div className="glass-card !bg-white w-full md:w-80 p-8 relative z-10 flex flex-col items-center mb-8 md:mb-0">
                <div className="w-16 h-16 rounded-full bg-[var(--accent)] text-white text-2xl font-black flex items-center justify-center mb-6 shadow-xl shadow-[var(--accent)]/20">1</div>
                <h3 className="text-xl font-bold mb-3">Upload your profile</h3>
                <p className="text-text-secondary text-sm leading-relaxed">Connect your GitHub and upload your latest resume. It takes 30 seconds.</p>
              </div>

              <div className="glass-card !bg-white w-full md:w-80 p-8 relative z-10 flex flex-col items-center mb-8 md:mb-0">
                <div className="w-16 h-16 rounded-full bg-[var(--accent)] text-white text-2xl font-black flex items-center justify-center mb-6 shadow-xl shadow-[var(--accent)]/20">2</div>
                <h3 className="text-xl font-bold mb-3">ARIA Audits Everything</h3>
                <p className="text-text-secondary text-sm leading-relaxed">Our AI analyzes your code quality, skills, and prepares a custom interview plan.</p>
              </div>

              <div className="glass-card !bg-white w-full md:w-80 p-8 relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[var(--accent)] text-white text-2xl font-black flex items-center justify-center mb-6 shadow-xl shadow-[var(--accent)]/20">3</div>
                <h3 className="text-xl font-bold mb-3">Get Hired</h3>
                <p className="text-text-secondary text-sm leading-relaxed">Apply to verified jobs with confidence, pass the ATS, and crush the interview.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. SOCIAL PROOF + 6. STATS */}
        <section className="py-24 bg-[var(--accent)]/5 border-y border-[var(--accent)]/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-8">Trusted by students landing jobs at</p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale font-black text-2xl tracking-tighter">
                <span>Google</span>
                <span>Microsoft</span>
                <span>amazon</span>
                <span>Meta</span>
                <span>STRIPE</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center pt-8 border-t border-[var(--accent)]/10">
              <div>
                <div className="text-4xl font-black text-[var(--accent)] mb-2">25K+</div>
                <div className="text-sm font-bold text-text-secondary">Active Users</div>
              </div>
              <div>
                <div className="text-4xl font-black text-[var(--accent)] mb-2">98%</div>
                <div className="text-sm font-bold text-text-secondary">Interview Success Rate</div>
              </div>
              <div>
                <div className="text-4xl font-black text-[var(--accent)] mb-2">10K+</div>
                <div className="text-sm font-bold text-text-secondary">Jobs Matched</div>
              </div>
              <div>
                <div className="text-4xl font-black text-[var(--accent)] mb-2">4.9/5</div>
                <div className="text-sm font-bold text-text-secondary">User Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. PRICING */}
        <section id="pricing" className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-black text-center mb-16">Invest in your career</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free */}
              <div className="glass-card p-8 flex flex-col">
                <h3 className="text-2xl font-black mb-2">Free</h3>
                <div className="text-4xl font-black mb-6">₹0<span className="text-lg text-text-secondary font-medium">/mo</span></div>
                <ul className="space-y-4 mb-8 flex-1 text-sm font-medium">
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-[var(--success)] shrink-0" /> 5 interviews per month</li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-[var(--success)] shrink-0" /> 3 repo scans per month</li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-[var(--success)] shrink-0" /> Basic Resume Analysis</li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-[var(--success)] shrink-0" /> Scam detector access</li>
                </ul>
                <Link href="/login" className="btn-ghost text-center w-full block">Get Started Free</Link>
              </div>

              {/* Pro */}
              <div className="glass-card p-8 flex flex-col relative transform md:-translate-y-4 border-[var(--accent)]/50 shadow-2xl shadow-[var(--accent)]/10 bg-white/80">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--accent)] text-white text-xs font-bold px-4 py-1 rounded-full">
                  POPULAR
                </div>
                <h3 className="text-2xl font-black mb-2 text-[var(--accent)]">Pro</h3>
                <div className="text-4xl font-black mb-6">₹199<span className="text-lg text-text-secondary font-medium">/mo</span></div>
                <ul className="space-y-4 mb-8 flex-1 text-sm font-medium">
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-[var(--accent)] shrink-0" /> Unlimited everything</li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-[var(--accent)] shrink-0" /> PDF audit reports</li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-[var(--accent)] shrink-0" /> Recruiter visibility network</li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-[var(--accent)] shrink-0" /> Priority processing queue</li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-[var(--accent)] shrink-0" /> Custom roadmap generation</li>
                </ul>
                <button className="btn-primary w-full shadow-lg shadow-[var(--accent)]/30">Start Free Trial</button>
              </div>

              {/* Anime Unlock */}
              <div className="glass-card p-8 flex flex-col bg-gradient-to-br from-white/70 to-[#f72585]/5">
                <h3 className="text-2xl font-black mb-2 text-[#f72585]">Anime Unlock</h3>
                <div className="text-4xl font-black mb-6">₹49<span className="text-lg text-text-secondary font-medium">/skin</span></div>
                <ul className="space-y-4 mb-8 flex-1 text-sm font-medium">
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-[#f72585] shrink-0" /> Gojo Satoru Interviewer</li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-[#f72585] shrink-0" /> Captain America Coach</li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-[#f72585] shrink-0" /> Iron Man Code Review</li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-[#f72585] shrink-0" /> Tony Stark Mode</li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-text-secondary shrink-0" /> + More added monthly</li>
                </ul>
                <button className="btn-ghost border-[#f72585] text-[#f72585] hover:bg-[#f72585]/10 w-full block text-center">Browse Skins</button>
              </div>
            </div>
          </div>
        </section>

        {/* 8. CTA BANNER */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-6">
            <div className="glass-card p-12 text-center bg-[var(--accent)]/5 border-[var(--accent)]/20">
              <h2 className="text-4xl font-black mb-6">Ready to build the future you?</h2>
              <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
                Join 25,000+ developers who are taking control of their career trajectory with ARIA.
              </p>
              <Link href="/login" className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 9. FOOTER */}
      <footer className="border-t border-black/5 bg-white/50 backdrop-blur-sm py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-black text-[var(--accent)] tracking-tighter">ARIA+</div>
          <div className="flex gap-6 text-sm font-semibold text-text-secondary">
            <Link href="#" className="hover:text-[var(--accent)]">Terms</Link>
            <Link href="#" className="hover:text-[var(--accent)]">Privacy</Link>
            <Link href="#" className="hover:text-[var(--accent)]">Contact</Link>
          </div>
          <div className="text-sm font-medium text-text-secondary">
            Built with ❤️ at IEEE AI FOR IMPACT 2026
          </div>
        </div>
      </footer>
    </div>
  );
}
