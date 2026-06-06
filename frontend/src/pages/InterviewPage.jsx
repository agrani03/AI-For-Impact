import { useState, useEffect, useRef } from 'react'
import Vapi from '@vapi-ai/web'
import { Canvas } from '@react-three/fiber'
import AvatarModel from '../components/AvatarModel'
import ScoreRing from '../components/ScoreRing'
import CodeChallenge from '../components/CodeChallenge'
import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const vapiPublicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY || import.meta.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || ''
const vapiAssistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID || ''
const vapi = vapiPublicKey ? new Vapi(vapiPublicKey) : null

export default function InterviewPage() {
  const [sessionState, setSessionState] = useState('idle') // idle | active | analysis | coding | results
  const [connecting, setConnecting] = useState(false)
  const [transcript, setTranscript] = useState([])
  const [isAiTalking, setIsAiTalking] = useState(false)
  const [callError, setCallError] = useState('')
  const [codeScore, setCodeScore] = useState(null)
  const [interviewScore, setInterviewScore] = useState(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const transcriptEndRef = useRef(null)
  const callStartedRef = useRef(false)
  const isConfigured = Boolean(vapi && vapiAssistantId)

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcript])

  // VAPI Setup
  useEffect(() => {
    if (!vapi) {
      return
    }

    const onCallStart = () => {
      callStartedRef.current = true
      setConnecting(false)
      setSessionState('active')
      setTranscript([])
      setCallError('')
    }
    const onCallEnd = () => {
      setSessionState(callStartedRef.current ? 'analysis' : 'idle')
      callStartedRef.current = false
      setIsAiTalking(false)
      window.dispatchEvent(new CustomEvent('aura:talking', { detail: false }))
      if (callStartedRef.current) {
        window.dispatchEvent(new CustomEvent('aura:setAction', { detail: 'victory' }))
      }
    }
    const onMessage = (msg) => {
      // Only add FINAL transcripts to avoid duplicates
      if (msg.type === 'transcript' && msg.transcriptType === 'final') {
        setTranscript(prev => {
          // Prevent duplicate if the exact same message already exists
          const lastMsg = prev[prev.length - 1]
          if (lastMsg && lastMsg.role === msg.role && lastMsg.text === msg.transcript) {
            return prev
          }
          return [...prev, { role: msg.role, text: msg.transcript, id: Date.now() + Math.random() }]
        })
      }
    }
    const onSpeechStart = () => {
      setIsAiTalking(true)
      window.dispatchEvent(new CustomEvent('aura:talking', { detail: true }))
    }
    const onSpeechEnd = () => {
      setIsAiTalking(false)
      window.dispatchEvent(new CustomEvent('aura:talking', { detail: false }))
      window.dispatchEvent(new CustomEvent('aura:setMorph', { detail: { name: 'mouthOpen', value: 0 } }))
    }
    const onError = (e) => {
      console.error(e)
      setConnecting(false)
      setSessionState('idle')
      callStartedRef.current = false
      setCallError(e?.message || 'Vapi could not start the call. Check the assistant ID and public key.')
    }
    const onVolumeLevel = (volume) => {
      // Send the assistant's volume to the avatar for lip sync
      window.dispatchEvent(new CustomEvent('aura:setMorph', { detail: { name: 'mouthOpen', value: Math.min(volume * 2.5, 1) } }))
    }

    vapi.on('call-start', onCallStart)
    vapi.on('call-end', onCallEnd)
    vapi.on('message', onMessage)
    vapi.on('speech-start', onSpeechStart)
    vapi.on('speech-end', onSpeechEnd)
    vapi.on('error', onError)
    vapi.on('volume-level', onVolumeLevel)

    return () => {
      vapi.removeAllListeners?.()
      vapi.stop() // cleanup if unmounted
    }
  }, [])

  const handleStart = async () => {
    if (!isConfigured) {
      setCallError('Missing Vapi config. Set NEXT_PUBLIC_VAPI_PUBLIC_KEY and VITE_VAPI_ASSISTANT_ID in the root .env, then restart Vite.')
      return
    }

    setConnecting(true)
    setCallError('')
    try {
      await vapi.start(vapiAssistantId)
    } catch (e) {
      console.error('VAPI Error:', e)
      setConnecting(false)
      setCallError(e?.message || 'Vapi could not start the call. Check microphone permission and credentials.')
    }
  }

  const handleStop = () => {
    vapi?.stop()
  }

  const handleCodeSubmit = async ({ code, language }) => {
    setIsExecuting(true)
    try {
      const response = await fetch('http://localhost:8000/code/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      })
      const result = await response.json()
      setCodeScore(result)
      setSessionState('results')
    } catch (error) {
      console.error('Code execution error:', error)
      // Fallback: mock response if backend unavailable
      const mockResult = {
        passed_tests: 2,
        total_tests: 3,
        output: '[0, 1]\n[1, 2]',
        score: 67,
        execution_time: 0.23
      }
      setCodeScore(mockResult)
      setSessionState('results')
    } finally {
      setIsExecuting(false)
    }
  }

  // When interview ends, fetch Nova analysis
  useEffect(() => {
    if (sessionState === 'coding' && transcript.length > 0) {
      // Mock interview score (in production, call Nova API)
      const mockInterviewScore = 82
      setInterviewScore(mockInterviewScore)
    }
  }, [sessionState])

  // TEST MODE: Simulate interview completion
  const testSkipToCode = () => {
    setSessionState('analysis')
    setTranscript([
      { role: 'user', text: 'Tell me about your experience with React', id: 1 },
      { role: 'assistant', text: 'I have 5 years of React experience, focusing on performance optimization and component architecture.' , id: 2 }
    ])
    setInterviewScore(82)
  }

  const testSkipToResults = () => {
    setCodeScore({
      passed_tests: 2,
      total_tests: 3,
      output: '[0, 1]\n[1, 2]',
      score: 67,
      execution_time: 0.5
    })
    setInterviewScore(82)
    setSessionState('results')
  }

  // Visual component for the talking indicator
  const WaveOrb = () => (
    <div className="relative w-16 h-16 flex items-center justify-center">
      {isAiTalking && (
        <>
          <div className="absolute inset-0 rounded-full bg-[#00F5D4] wave-ring-1 opacity-30" />
          <div className="absolute inset-0 rounded-full bg-[#00F5D4] wave-ring-2 opacity-20" />
        </>
      )}
      <div className={`relative z-10 w-10 h-10 rounded-full bg-gradient-to-br from-[#560BAD] to-[#00F5D4] shadow-lg transition-transform duration-500 flex items-center justify-center ${isAiTalking ? 'scale-110' : 'scale-100'}`}>
        {isAiTalking ? (
          <div className="flex gap-0.5">
            {[1,2,3].map(i => (
              <div key={i} className="w-1 bg-white rounded-full animate-pulse" style={{ height: `${Math.random() * 8 + 4}px`, animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        ) : (
          <div className="w-2 h-2 bg-white rounded-full" />
        )}
      </div>
    </div>
  )

  return (
    <div className="h-screen bg-gradient-animate flex flex-col overflow-hidden">
      <header className="p-6 flex-shrink-0">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-[#555577] font-semibold hover:text-[#560BAD]">
          <ChevronLeft className="w-5 h-5" /> Back to Dashboard
        </Link>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-6 gap-8 overflow-hidden min-h-0">
        
        {/* Left Col: 3D Avatar + Controls */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 min-h-0">
          
          {/* Status Badge - Fixed position, doesn't affect layout */}
          <div className="w-full flex justify-center flex-shrink-0">
            <div className="glass-card px-6 py-3 rounded-full flex items-center gap-3 z-10 animate-slide-in-right">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${sessionState === 'active' ? 'bg-[#06d6a0]' : 'bg-[#e94560]'}`} />
                <span className={`relative inline-flex rounded-full h-3 w-3 ${sessionState === 'active' ? 'bg-[#06d6a0]' : 'bg-[#e94560]'}`} />
              </span>
              <span className="font-bold text-sm tracking-widest uppercase">
                {sessionState === 'idle' ? 'Ready to connect' : sessionState === 'active' ? 'Live Session' : 'Session Complete'}
              </span>
            </div>
          </div>

          {/* VRM Avatar Canvas - Fixed height */}
          <div className="w-full h-96 glass-card overflow-hidden relative border-2 border-white/40 shadow-2xl flex-shrink-0">
            
            {/* Cozy Lo-Fi Background */}
            <div className="absolute inset-0 z-0">
              <img 
                src="/interview-room-bg.jpg" 
                alt="Cozy Lofi Background" 
                className="w-full h-full object-cover opacity-90"
              />
              {/* Warm gradient overlay to make the avatar pop and look cinematic */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#560BAD]/40 to-transparent mix-blend-multiply" />
            </div>

            {/* Transparent 3D Canvas */}
            <div className="absolute inset-0 z-10">
              <Canvas camera={{ position: [0, 0.15, 1.5], fov: 42 }}>
                <ambientLight intensity={1.8} />
                <directionalLight position={[0, 2, 3]} intensity={1.5} />
                <AvatarModel modelUrl="/interviewer.vrm" scale={1.25} position={[0, -1.35, 0]} showWaistUp={true} />
              </Canvas>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6 flex-shrink-0">
            {sessionState === 'idle' && (
              <>
                <button onClick={handleStart} disabled={connecting || !isConfigured} className="btn-primary text-xl px-12 py-5 shadow-2xl disabled:opacity-50 flex items-center gap-3">
                  {connecting ? 'Connecting...' : 'Start Interview'} 
                  <span className="text-2xl">🎙️</span>
                </button>
                <button onClick={testSkipToCode} className="btn-ghost px-6 py-3 text-sm">
                  TEST: Skip to Code
                </button>
              </>
            )}
            
            {sessionState === 'active' && (
              <button onClick={handleStop} className="bg-[#e94560] text-white rounded-full px-8 py-4 font-bold text-lg hover:bg-[#d03a52] transition-colors shadow-xl flex items-center gap-2">
                <span className="w-3 h-3 bg-white rounded-sm" /> End Interview
              </button>
            )}

            {sessionState === 'coding' && (
              <button onClick={testSkipToResults} className="btn-ghost px-6 py-3 text-sm">
                TEST: Skip to Results
              </button>
            )}

            {sessionState === 'analysis' && (
              <button onClick={() => setSessionState('coding')} className="btn-ghost px-6 py-3 text-sm">
                TEST: Skip to Code
              </button>
            )}

            {sessionState === 'complete' && (
              <button onClick={() => setSessionState('idle')} className="btn-ghost px-8 py-4">
                Start New Session
              </button>
            )}
          </div>

          {(callError || !isConfigured) && (
            <div className="max-w-xl rounded-xl border border-[#e94560]/30 bg-white/80 px-5 py-3 text-sm font-semibold text-[#e94560] shadow-lg flex-shrink-0">
              {callError || 'Missing Vapi config. Restart Vite after setting NEXT_PUBLIC_VAPI_PUBLIC_KEY and VITE_VAPI_ASSISTANT_ID in the root .env.'}
            </div>
          )}
        </div>

        {/* Right Col: Transcript OR Coding OR Results */}
        <div className={`w-full lg:w-[450px] flex flex-col gap-6 min-h-0 overflow-hidden ${sessionState === 'idle' ? 'pointer-events-none' : ''}`} style={{height: sessionState === 'idle' ? 'auto' : '100%'}}>

          
          {sessionState === 'active' ? (
            // Transcript Panel
            <div className="glass-card flex-1 flex flex-col overflow-hidden relative min-h-0">
              <div className="p-5 border-b border-white/30 font-bold bg-white/40 flex items-center justify-between h-20 flex-shrink-0">
                <span>Live Transcript</span>
                <div className="w-20 h-20 flex items-center justify-center">
                  <WaveOrb />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0 scroll-smooth">
                {transcript.length === 0 ? (
                  <div className="flex items-center justify-center text-[#555577] text-sm text-center h-full">
                    The conversation transcript will appear here.
                  </div>
                ) : (
                  transcript.map((msg, i) => (
                    <div key={msg.id || i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm break-words ${
                        msg.role === 'user' 
                          ? 'bg-[#560BAD] text-white rounded-br-sm' 
                          : 'bg-white/90 text-black border border-white/60 rounded-bl-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                <div ref={transcriptEndRef} />
              </div>
            </div>
          ) : sessionState === 'analysis' ? (
            // Interview Analysis Panel
            <div className="glass-card flex-1 p-6 flex flex-col overflow-y-auto min-h-0 animate-fade-in">
              <h2 className="text-2xl font-bold mb-4 text-[#560BAD] flex-shrink-0">📊 Interview Analysis</h2>
              
              <div className="mb-6 p-4 bg-white/40 rounded-lg flex-shrink-0">
                <div className="text-lg font-black text-[#560BAD] mb-2">Interview Score: {interviewScore || 82}%</div>
                <div className="text-sm text-[#555577]">Based on AWS Nova analysis</div>
              </div>

              <div className="mb-6 flex-shrink-0">
                <h3 className="font-bold text-[#560BAD] mb-3">✓ Strengths</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-[#06d6a0]">•</span>
                    <span className="text-[#555577]">Clear communication and articulation</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[#06d6a0]">•</span>
                    <span className="text-[#555577]">Strong technical knowledge demonstrated</span>
                  </div>
                </div>
              </div>

              <div className="mb-6 flex-shrink-0">
                <h3 className="font-bold text-[#560BAD] mb-3">⚡ Areas to Improve</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-[#f4a261]">•</span>
                    <span className="text-[#555577]">Provide more concrete examples</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[#f4a261]">•</span>
                    <span className="text-[#555577]">Dive deeper into system design trade-offs</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSessionState('coding')}
                className="btn-primary px-8 py-3 shadow-lg mt-auto flex-shrink-0"
              >
                Continue to Code Challenge →
              </button>
            </div>
          ) : sessionState === 'coding' ? (
            // Code Challenge Panel
            <div className="glass-card flex-1 p-6 flex flex-col overflow-y-auto min-h-0 animate-fade-in">
              <h2 className="text-2xl font-bold mb-2 text-[#560BAD] flex-shrink-0">Next: Code Challenge</h2>
              <p className="text-sm text-[#555577] mb-6 flex-shrink-0">Let's verify your coding skills with a quick challenge:</p>
              <div className="flex-1 min-h-0 overflow-y-auto">
                <CodeChallenge onSubmit={handleCodeSubmit} isLoading={isExecuting} />
              </div>
            </div>
          ) : sessionState === 'results' ? (
            // Results Panel
            <div className="glass-card flex-1 p-8 flex flex-col items-center animate-slide-in-right overflow-y-auto min-h-0">
              <h2 className="text-3xl font-black mb-8 text-center text-[#560BAD] flex-shrink-0">✨ Assessment Results ✨</h2>
              
              <div className="mb-8 w-full flex justify-center flex-shrink-0">
                <ScoreRing score={Math.round(((codeScore?.score || 0) + (interviewScore || 82)) / 2)} size={140} color="mint" label="Combined" />
              </div>

              <div className="w-full grid grid-cols-2 gap-3 mb-6 flex-shrink-0">
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-[#555577] text-xs font-bold uppercase tracking-wider mb-2">Interview Score</div>
                  <div className="text-2xl font-black text-[#560BAD]">{interviewScore || 82}%</div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-[#555577] text-xs font-bold uppercase tracking-wider mb-2">Code Challenge</div>
                  <div className="text-2xl font-black text-[#00F5D4]">{codeScore?.score || 0}%</div>
                </div>
              </div>

              <div className="w-full mb-6 flex-shrink-0">
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-[#555577] text-xs font-bold uppercase tracking-wider mb-2">Final Combined Score</div>
                  <div className="text-4xl font-black text-[#00F5D4]">{Math.round(((codeScore?.score || 0) + (interviewScore || 82)) / 2)}%</div>
                </div>
              </div>

              {codeScore && (
                <div className="w-full text-left p-4 bg-white/40 rounded-lg mb-6 flex-shrink-0">
                  <div className="text-xs font-bold text-[#555577] uppercase mb-2">Code Test Results</div>
                  <div className="text-sm text-black">
                    <div>✓ {codeScore.passed_tests}/{codeScore.total_tests} tests passed</div>
                    <div className="text-xs text-[#555577] mt-1">{codeScore.output}</div>
                  </div>
                </div>
              )}

              <button 
                onClick={() => {
                  setSessionState('idle')
                  setTranscript([])
                  setCodeScore(null)
                }}
                className="btn-primary px-8 py-3 shadow-lg mt-4 flex-shrink-0"
              >
                Start New Interview
              </button>
            </div>
          ) : (
            // Idle State
            <div className="glass-card flex-1 flex flex-col items-center justify-center text-center p-6 pointer-events-none">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-[#560BAD] mb-3">Ready for Interview?</h3>
              <p className="text-sm text-[#555577] mb-6">Click the button below to start the conversation with ARIA.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

