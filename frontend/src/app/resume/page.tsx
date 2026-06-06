'use client';

import React, { useState, useRef } from 'react';

// Interfaces
interface ResumeReport {
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  ats_compatibility: number;
  top_job_recommendations: string[];
  improvement_suggestions: string[];
}

type State = 'idle' | 'loading' | 'result';

export default function ResumePage() {
  const [state, setState] = useState<State>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<ResumeReport | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (validTypes.includes(droppedFile.type) || droppedFile.name.match(/\.(pdf|jpg|jpeg|png)$/i)) {
        setFile(droppedFile);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleAnalyze = async () => {
    if (!file) return;
    
    setState('loading');
    setLoadingStep(0);
    
    // Simulate steps progress visually
    const interval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev >= 3) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_description', jobDescription);

    try {
      // In a real integration this URL would be parameterized, e.g. process.env.NEXT_PUBLIC_API_URL
      const response = await fetch('http://localhost:8000/resume/analyze', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Analysis failed');
      }
      
      const data: ResumeReport = await response.json();
      clearInterval(interval);
      setLoadingStep(4); // All done visually
      
      setResult(data);
      // Brief delay to let the final checkbox show before transitioning
      setTimeout(() => setState('result'), 600);
    } catch (error) {
      console.error(error);
      clearInterval(interval);
      alert("Error analyzing resume. Please ensure the backend is running and reachable.");
      setState('idle');
    }
  };

  const reset = () => {
    setState('idle');
    setFile(null);
    setJobDescription('');
    setResult(null);
    setLoadingStep(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {state === 'idle' && (
          <div className="space-y-8 bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
            <div className="text-center space-y-3">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Resume Analyzer</h1>
              <p className="text-lg text-slate-500">Upload your resume and optionally provide a job description to get tailored career feedback.</p>
            </div>
            
            <div 
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${file ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'}`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".pdf,.jpg,.jpeg,.png" 
              />
              <div className="text-5xl mb-4">📄</div>
              {file ? (
                <p className="text-blue-600 font-semibold text-lg">{file.name}</p>
              ) : (
                <p className="text-slate-600 font-medium text-lg">Drop your resume here or click to browse</p>
              )}
              <p className="text-sm text-slate-400 mt-2">Supports PDF, JPG, PNG</p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">Job Description (Optional)</label>
              <textarea 
                className="w-full h-32 p-4 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                placeholder="Paste the job description for a more accurate analysis..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <button 
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 flex justify-center items-center ${file ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              disabled={!file}
              onClick={handleAnalyze}
            >
              <span className="mr-2">🔍</span> Analyze My Resume
            </button>
          </div>
        )}

        {state === 'loading' && (
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-10 min-h-[500px]">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 blur-xl opacity-20 rounded-full"></div>
              <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl animate-pulse relative z-10">
                <span className="text-3xl font-black text-white tracking-widest">ARIA</span>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 text-center">Analyzing your resume against live market data...</h2>
            
            <div className="w-full max-w-md space-y-5 bg-slate-50 p-6 rounded-2xl">
              {[
                'Extracting text from resume',
                'Embedding resume profile',
                'Searching market knowledge data',
                'Generating career insights'
              ].map((step, idx) => (
                <div key={idx} className="flex items-center space-x-4 text-slate-600">
                  <div className="w-8 h-8 flex items-center justify-center shrink-0">
                    {loadingStep > idx ? (
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 font-bold">✓</span>
                      </div>
                    ) : loadingStep === idx ? (
                      <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                    )}
                  </div>
                  <span className={loadingStep >= idx ? 'text-slate-800 font-semibold' : 'text-slate-400 font-medium'}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {state === 'result' && result && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Your Resume Analysis</h1>
              <button 
                onClick={reset}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-300 font-semibold transition-all shadow-sm"
              >
                Re-analyze
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Row 1: Score & Skills */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13.5h-13L12 6.5z"/></svg>
                </div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 relative z-10">Match Score</div>
                <div className="relative w-48 h-48 flex items-center justify-center relative z-10">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" className="stroke-slate-100" strokeWidth="10" fill="none" />
                    <circle 
                      cx="50" cy="50" r="42" 
                      className={`${result.match_score > 80 ? 'stroke-green-500' : result.match_score > 60 ? 'stroke-yellow-500' : 'stroke-red-500'} transition-all duration-1000 ease-out`}
                      strokeWidth="10" 
                      fill="none" 
                      strokeDasharray="263.89" 
                      strokeDashoffset={263.89 - (263.89 * result.match_score) / 100} 
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-6xl font-black text-slate-900">{result.match_score}</span>
                    <span className="text-sm text-slate-400 font-bold mt-1">/ 100</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-8 flex flex-col justify-center">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-lg">✅</span>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Matched Skills</h3>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {result.matched_skills.map((skill, i) => (
                      <span key={i} className="px-3.5 py-1.5 bg-green-50 text-green-700 border border-green-200/60 rounded-lg text-sm font-semibold shadow-sm">
                        {skill}
                      </span>
                    ))}
                    {result.matched_skills.length === 0 && <span className="text-sm text-slate-400 italic">None found</span>}
                  </div>
                </div>
                
                <div className="h-px w-full bg-slate-100"></div>

                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-lg">❌</span>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Missing Skills</h3>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {result.missing_skills.map((skill, i) => (
                      <span key={i} className="px-3.5 py-1.5 bg-red-50 text-red-700 border border-red-200/60 rounded-lg text-sm font-semibold shadow-sm">
                        {skill}
                      </span>
                    ))}
                    {result.missing_skills.length === 0 && <span className="text-sm text-slate-400 italic">None missing</span>}
                  </div>
                </div>
              </div>

              {/* Row 2: ATS Compatibility */}
              <div className="md:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">ATS Compatibility</h3>
                    <p className="text-sm text-slate-400">How well applicant tracking systems can parse your resume</p>
                  </div>
                  <span className="text-3xl font-black text-slate-800 mt-2 sm:mt-0">{result.ats_compatibility}%</span>
                </div>
                <div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out relative"
                    style={{ width: `${result.ats_compatibility}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>
              </div>

              {/* Row 3: Top Jobs */}
              <div className="md:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-extrabold text-slate-900 mb-6">Top Jobs For You Right Now</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {result.top_job_recommendations.map((job, i) => (
                    <div key={i} className="p-6 border border-slate-200 rounded-2xl hover:border-blue-400 hover:shadow-lg transition-all group bg-white flex flex-col justify-between h-full transform hover:-translate-y-1">
                      <h4 className="font-bold text-slate-800 mb-6 text-lg leading-tight">{job}</h4>
                      <button className="text-sm font-bold text-blue-600 group-hover:text-blue-700 flex items-center w-full mt-auto">
                        View Jobs <span className="ml-1.5 group-hover:translate-x-1.5 transition-transform">→</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 4: Improvements */}
              <div className="md:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-extrabold text-slate-900 mb-6">Improvement Suggestions</h3>
                <ul className="space-y-4">
                  {result.improvement_suggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start bg-slate-50 p-4 rounded-xl">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-black mr-4 mt-0.5 shadow-sm">
                        {i + 1}
                      </span>
                      <span className="text-slate-700 font-medium leading-relaxed">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
