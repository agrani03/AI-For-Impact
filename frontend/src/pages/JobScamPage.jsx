import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ShieldAlert, RefreshCw, AlertTriangle, CheckCircle, Mail, UploadCloud } from 'lucide-react'
import ScoreRing from '../components/ScoreRing'

const API = import.meta.env.VITE_API_URL || import.meta.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function JobScamPage() {
  const [mode, setMode] = useState('description')
  const [status, setStatus] = useState('idle')
  const [jobUrl, setJobUrl] = useState('')
  const [description, setDescription] = useState('No interview required. Pay registration fee and send CV on WhatsApp to recruiter.jobsyee@gmail.com.')
  const [file, setFile] = useState(null)
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')

  const scan = async () => {
    setStatus('loading')
    setError('')
    const form = new FormData()
    if (mode === 'url') form.append('url', jobUrl)
    if (mode === 'description') form.append('description', description)
    if (mode === 'image' && file) form.append('file', file)

    try {
      const response = await fetch(`${API}/jobs/scan`, { method: 'POST', body: form })
      if (!response.ok) throw new Error('Scan failed')
      setReport(await response.json())
      setStatus('result')
    } catch (e) {
      setError(e.message || 'Could not scan this job posting.')
      setStatus('idle')
    }
  }

  const canScan = mode === 'url' ? jobUrl.trim() : mode === 'image' ? file : description.trim()
  const verdictColor = report?.verdict === 'SAFE' ? 'text-[#06d6a0]' : report?.verdict === 'SCAM' ? 'text-[#e94560]' : 'text-[#f4a261]'

  return (
    <div className="min-h-screen bg-gradient-animate p-6">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-[#555577] font-semibold hover:text-[#560BAD] mb-6">
        <ChevronLeft className="w-5 h-5" /> Back
      </Link>

      <div className="max-w-4xl mx-auto">
        {status !== 'result' && (
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#e94560]/10 text-[#e94560] flex items-center justify-center mb-5">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h1 className="text-3xl font-black mb-2">Job Scam Detector</h1>
            <p className="text-[#555577] mb-6">Scan a job post, link, flyer, or QR code for fraud signals.</p>

            <div className="grid grid-cols-3 gap-2 mb-6">
              {['description', 'url', 'image'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setMode(tab)}
                  className={`px-3 py-2 rounded-lg text-sm font-bold capitalize ${mode === tab ? 'bg-[#560BAD] text-white' : 'bg-white/60 text-[#555577]'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {mode === 'description' && (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={7}
                className="w-full p-4 rounded-xl border border-white/40 bg-white/70 outline-none mb-5"
                placeholder="Paste the job description here..."
              />
            )}

            {mode === 'url' && (
              <input
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                className="w-full p-4 rounded-xl border border-white/40 bg-white/70 outline-none mb-5"
                placeholder="https://company.com/careers/job"
              />
            )}

            {mode === 'image' && (
              <label className="flex flex-col items-center justify-center p-10 rounded-xl border-2 border-dashed border-white/60 bg-white/40 cursor-pointer mb-5">
                <UploadCloud className="w-8 h-8 text-[#555577] mb-2" />
                <span className="font-semibold text-[#555577]">{file ? file.name : 'Upload flyer or QR image'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </label>
            )}

            {error && <p className="text-sm text-[#e94560] font-semibold mb-4">{error}</p>}

            <button disabled={!canScan || status === 'loading'} onClick={scan} className="btn-primary w-full py-4 disabled:opacity-50">
              {status === 'loading' ? 'Scanning...' : 'Verify This Job'}
            </button>
          </div>
        )}

        {status === 'result' && report && (
          <div className="glass-card p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl font-black mb-2">Job Safety Analysis</h1>
                <p className="text-[#555577]">Analyzed at {new Date(report.analyzed_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setStatus('idle')} className="btn-ghost flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Scan Another
              </button>
            </div>

            <div className="grid md:grid-cols-[220px_1fr] gap-8">
              <div className="flex flex-col items-center justify-center bg-white/40 rounded-xl p-6">
                <ScoreRing score={report.fake_job_score} size={150} color={report.fake_job_score > 60 ? 'danger' : report.fake_job_score > 30 ? 'warning' : 'mint'} label="Scam Risk" />
                <div className={`mt-5 text-xl font-black ${verdictColor}`}>{report.verdict}</div>
              </div>

              <div className="space-y-5">
                <div className="bg-white/50 rounded-xl p-5">
                  <div className="text-xs font-black text-[#560BAD] uppercase mb-2">Reasoning</div>
                  <p className="text-sm text-[#555577] leading-relaxed">{report.reasoning}</p>
                </div>

                {report.suspicious_emails?.length > 0 && (
                  <div className="bg-[#e94560]/10 rounded-xl p-4 text-sm font-semibold text-[#e94560] flex gap-2">
                    <Mail className="w-5 h-5 shrink-0" /> Suspicious email: {report.suspicious_emails.join(', ')}
                  </div>
                )}

                <div>
                  <h2 className="text-sm font-black uppercase mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#f4a261]" /> Risk Factors
                  </h2>
                  <div className="space-y-2">
                    {(report.risk_factors || []).map((risk) => (
                      <div key={risk} className="bg-white/50 rounded-lg p-3 text-sm text-[#555577]">{risk}</div>
                    ))}
                    {(!report.risk_factors || report.risk_factors.length === 0) && (
                      <div className="bg-[#06d6a0]/10 rounded-lg p-3 text-sm text-[#06d6a0] flex gap-2">
                        <CheckCircle className="w-4 h-4" /> No major risk factors found.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
