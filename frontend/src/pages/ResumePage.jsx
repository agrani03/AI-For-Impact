import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function ResumePage() {
  const [state, setState] = useState('idle') // idle | loading | result
  const [file, setFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [result, setResult] = useState(null)
  const [loadingStep, setLoadingStep] = useState(0)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      if (validTypes.includes(droppedFile.type) || droppedFile.name.match(/\.(pdf|jpg|jpeg|png)$/i)) {
        setFile(droppedFile)
      }
    }
  }

  const handleDragOver = (e) => e.preventDefault()

  const handleAnalyze = async () => {
    if (!file) return
    setState('loading')
    setLoadingStep(0)
    
    const interval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev >= 3) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 1200)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('job_description', jobDescription)

    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API}/resume/analyze`, {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) throw new Error('Analysis failed')
      
      const data = await response.json()
      clearInterval(interval)
      setLoadingStep(4)
      setResult(data)
      setTimeout(() => setState('result'), 600)
    } catch (error) {
      console.error(error)
      clearInterval(interval)
      alert("Error analyzing resume. Please ensure the backend is running.")
      setState('idle')
    }
  }

  const reset = () => {
    setState('idle')
    setFile(null)
    setJobDescription('')
    setResult(null)
    setLoadingStep(0)
  }

  return (
    <div className="min-h-screen bg-gradient-animate py-12 px-4 sm:px-6 lg:px-8 relative">
      <Link to="/dashboard" className="absolute top-6 left-6 inline-flex items-center gap-2 text-[#555577] font-semibold hover:text-[#560BAD]">
        <ChevronLeft className="w-5 h-5" /> Back
      </Link>

      <div className="max-w-4xl mx-auto space-y-8">
        
        {state === 'idle' && (
          <div className="glass-card p-10 mt-8">
            <div className="text-center space-y-3 mb-10">
              <h1 className="text-4xl font-extrabold tracking-tight">Resume Analyzer</h1>
              <p className="text-lg text-[#555577]">Upload your resume and optionally provide a job description to get tailored career feedback.</p>
            </div>
            
            <div 
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 mb-8 bg-white/50 ${file ? 'border-[#560BAD] bg-[#560BAD]/5' : 'border-gray-300 hover:border-[#560BAD]/50'}`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
              <div className="text-5xl mb-4">📄</div>
              {file ? (
                <p className="text-[#560BAD] font-semibold text-lg">{file.name}</p>
              ) : (
                <p className="text-[#555577] font-medium text-lg">Drop your resume here or click to browse</p>
              )}
              <p className="text-sm text-gray-400 mt-2">Supports PDF, JPG, PNG</p>
            </div>

            <div className="space-y-3 mb-8">
              <label className="block text-sm font-semibold text-gray-700">Job Description (Optional)</label>
              <textarea 
                className="w-full h-32 p-4 border border-white/40 bg-white/60 rounded-xl focus:ring-4 focus:ring-[#560BAD]/20 focus:border-[#560BAD] outline-none transition-all resize-none"
                placeholder="Paste the job description for a more accurate analysis..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <button 
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 flex justify-center items-center ${file ? 'btn-primary' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              disabled={!file}
              onClick={handleAnalyze}
            >
              <span className="mr-2">🔍</span> Analyze My Resume
            </button>
          </div>
        )}

        {state === 'loading' && (
          <div className="glass-card p-12 flex flex-col items-center justify-center space-y-10 min-h-[500px]">
            <div className="relative">
              <div className="absolute inset-0 bg-[#00F5D4] blur-xl opacity-20 rounded-full" />
              <div className="w-24 h-24 bg-gradient-to-tr from-[#560BAD] to-[#00F5D4] rounded-3xl flex items-center justify-center shadow-xl animate-pulse relative z-10">
                <span className="text-3xl font-black text-white tracking-widest">ARIA</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center">Analyzing your resume against live market data...</h2>
            
            <div className="w-full max-w-md space-y-5 bg-white/50 p-6 rounded-2xl">
              {['Extracting text from resume', 'Embedding resume profile', 'Searching market knowledge data', 'Generating career insights'].map((step, idx) => (
                <div key={idx} className="flex items-center space-x-4 text-[#555577]">
                  <div className="w-8 h-8 flex items-center justify-center shrink-0">
                    {loadingStep > idx ? (
                      <div className="w-8 h-8 rounded-full bg-[#06d6a0]/20 flex items-center justify-center">
                        <span className="text-[#06d6a0] font-bold">✓</span>
                      </div>
                    ) : loadingStep === idx ? (
                      <div className="w-6 h-6 border-2 border-[#560BAD] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <div className="w-3 h-3 bg-gray-300 rounded-full" />
                    )}
                  </div>
                  <span className={loadingStep >= idx ? 'text-black font-semibold' : 'text-gray-400 font-medium'}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {state === 'result' && result && (
          <div className="space-y-8 animate-slide-in-right">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-extrabold tracking-tight">Your Resume Analysis</h1>
              <button onClick={reset} className="btn-ghost">Re-analyze</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Score */}
              <div className="glass-card p-8 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 relative z-10">Match Score</div>
                <div className="relative w-48 h-48 flex items-center justify-center z-10">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" className="stroke-white/50" strokeWidth="10" fill="none" />
                    <circle 
                      cx="50" cy="50" r="42" 
                      className={`${result.match_score > 80 ? 'stroke-[#06d6a0]' : result.match_score > 60 ? 'stroke-[#f4a261]' : 'stroke-[#e94560]'} transition-all duration-1000 ease-out`}
                      strokeWidth="10" fill="none" strokeDasharray="263.89" 
                      strokeDashoffset={263.89 - (263.89 * result.match_score) / 100} strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-6xl font-black text-black">{result.match_score}</span>
                    <span className="text-sm text-gray-400 font-bold mt-1">/ 100</span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="glass-card p-8 space-y-8 flex flex-col justify-center">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-lg">✅</span>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Matched Skills</h3>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {result.matched_skills.map((skill, i) => (
                      <span key={i} className="px-3.5 py-1.5 bg-[#06d6a0]/10 text-[#06d6a0] border border-[#06d6a0]/30 rounded-lg text-sm font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="h-px w-full bg-white/50" />
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-lg">❌</span>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Missing Skills</h3>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {result.missing_skills.map((skill, i) => (
                      <span key={i} className="px-3.5 py-1.5 bg-[#e94560]/10 text-[#e94560] border border-[#e94560]/30 rounded-lg text-sm font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ATS */}
              <div className="md:col-span-2 glass-card p-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">ATS Compatibility</h3>
                    <p className="text-sm text-[#555577]">How well applicant tracking systems can parse your resume</p>
                  </div>
                  <span className="text-3xl font-black mt-2 sm:mt-0">{result.ats_compatibility}%</span>
                </div>
                <div className="w-full h-5 bg-white/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#560BAD] to-[#00F5D4] rounded-full transition-all duration-1000 relative" style={{ width: `${result.ats_compatibility}%` }} />
                </div>
              </div>

              {/* Top Jobs */}
              <div className="md:col-span-2 glass-card p-8">
                <h3 className="text-xl font-extrabold mb-6">Top Jobs For You Right Now</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {result.top_job_recommendations.map((job, i) => (
                    <div key={i} className="p-6 bg-white/50 border border-white rounded-2xl hover:border-[#560BAD] hover:shadow-lg transition-all group flex flex-col justify-between h-full transform hover:-translate-y-1">
                      <h4 className="font-bold mb-6 text-lg leading-tight">{job}</h4>
                      <button className="text-sm font-bold text-[#560BAD] flex items-center w-full mt-auto">
                        View Jobs <span className="ml-1.5 group-hover:translate-x-1.5 transition-transform">→</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              <div className="md:col-span-2 glass-card p-8">
                <h3 className="text-xl font-extrabold mb-6">Improvement Suggestions</h3>
                <ul className="space-y-4">
                  {result.improvement_suggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start bg-white/50 p-4 rounded-xl">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#560BAD]/10 text-[#560BAD] flex items-center justify-center text-sm font-black mr-4 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="font-medium leading-relaxed">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  )
}
