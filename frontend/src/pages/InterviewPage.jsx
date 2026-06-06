import { useState, useEffect, useRef } from 'react'
import Vapi from '@vapi-ai/web'
import { Canvas } from '@react-three/fiber'
import AvatarModel from '../components/AvatarModel'
import ScoreRing from '../components/ScoreRing'
import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const vapiPublicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY || import.meta.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || ''
const vapiAssistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID || ''
const vapi = vapiPublicKey ? new Vapi(vapiPublicKey) : null

export default function InterviewPage() {
  const [sessionState, setSessionState] = useState('idle') // idle | active | complete
  const [connecting, setConnecting] = useState(false)
  const [transcript, setTranscript] = useState([])
  const [isAiTalking, setIsAiTalking] = useState(false)
  const [callError, setCallError] = useState('')
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
      setSessionState(callStartedRef.current ? 'complete' : 'idle')
      callStartedRef.current = false
      setIsAiTalking(false)
      window.dispatchEvent(new CustomEvent('aura:talking', { detail: false }))
      if (callStartedRef.current) {
        window.dispatchEvent(new CustomEvent('aura:setAction', { detail: 'victory' }))
      }
    }
    const onMessage = (msg) => {
      if (msg.type === 'transcript' && msg.transcriptType === 'final') {
        setTranscript(prev => [...prev, { role: msg.role, text: msg.transcript }])
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
    <div className="min-h-screen bg-gradient-animate flex flex-col">
      <header className="p-6">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-[#555577] font-semibold hover:text-[#560BAD]">
          <ChevronLeft className="w-5 h-5" /> Back to Dashboard
        </Link>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-6 gap-8 pb-12">
        
        {/* Left Col: 3D Avatar + Controls */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8 relative">
          
          {/* Status Badge - Fixed position, doesn't affect layout */}
          <div className="w-full flex justify-center">
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

          {/* VRM Avatar Canvas */}
          <div className="w-full h-[500px] glass-card overflow-hidden relative border-2 border-white/40 shadow-2xl">
            
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
          <div className="flex items-center gap-6">
            {sessionState === 'idle' && (
              <button onClick={handleStart} disabled={connecting || !isConfigured} className="btn-primary text-xl px-12 py-5 shadow-2xl disabled:opacity-50 flex items-center gap-3">
                {connecting ? 'Connecting...' : 'Start Interview'} 
                <span className="text-2xl">🎙️</span>
              </button>
            )}
            
            {sessionState === 'active' && (
              <button onClick={handleStop} className="bg-[#e94560] text-white rounded-full px-8 py-4 font-bold text-lg hover:bg-[#d03a52] transition-colors shadow-xl flex items-center gap-2">
                <span className="w-3 h-3 bg-white rounded-sm" /> End Interview
              </button>
            )}

            {sessionState === 'complete' && (
              <button onClick={() => setSessionState('idle')} className="btn-ghost px-8 py-4">
                Start New Session
              </button>
            )}
          </div>

          {(callError || !isConfigured) && (
            <div className="max-w-xl rounded-xl border border-[#e94560]/30 bg-white/80 px-5 py-3 text-sm font-semibold text-[#e94560] shadow-lg">
              {callError || 'Missing Vapi config. Restart Vite after setting NEXT_PUBLIC_VAPI_PUBLIC_KEY and VITE_VAPI_ASSISTANT_ID in the root .env.'}
            </div>
          )}
        </div>

        {/* Right Col: Transcript OR Results */}
        <div className="w-full lg:w-[450px] flex flex-col gap-6">
          
          {sessionState !== 'complete' ? (
            <div className="glass-card flex-1 flex flex-col overflow-hidden relative">
              <div className="p-5 border-b border-white/30 font-bold bg-white/40 flex items-center justify-between h-20">
                <span>Live Transcript</span>
                <div className="w-20 h-20 flex items-center justify-center">
                  <WaveOrb />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {transcript.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[#555577] text-sm text-center">
                    The conversation transcript will appear here.
                  </div>
                ) : (
                  transcript.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
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
          ) : (
            // Results Panel
            <div className="glass-card flex-1 p-8 flex flex-col items-center animate-slide-in-right overflow-y-auto">
              <h2 className="text-3xl font-black mb-6 text-center text-[#560BAD]">Interview Complete! 🎉</h2>
              
              <div className="mb-8 w-full flex justify-center">
                <ScoreRing score={85} size={140} color="mint" label="Overall Score" />
              </div>

              <div className="w-full grid grid-cols-2 gap-3 mb-8">
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-[#555577] text-xs font-bold uppercase tracking-wider mb-2">Clarity</div>
                  <div className="text-2xl font-black text-[#560BAD]">92%</div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-[#555577] text-xs font-bold uppercase tracking-wider mb-2">Confidence</div>
                  <div className="text-2xl font-black text-[#00F5D4]">78%</div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center col-span-2">
                  <div className="text-[#555577] text-xs font-bold uppercase tracking-wider mb-2">Technical Accuracy</div>
                  <div className="text-2xl font-black text-[#f4a261]">88%</div>
                </div>
              </div>

              <div className="w-full text-left space-y-3 border-t border-white/40 pt-6">
                <h3 className="font-bold text-[#560BAD] mb-4">📝 Feedback</h3>
                <div className="flex gap-3 text-sm">
                  <span className="text-[#06d6a0] font-bold text-lg leading-none mt-0.5">✓</span>
                  <span className="text-[#555577]">Great explanation of React lifecycle methods.</span>
                </div>
                <div className="flex gap-3 text-sm">
                  <span className="text-[#06d6a0] font-bold text-lg leading-none mt-0.5">✓</span>
                  <span className="text-[#555577]">Clear communication style.</span>
                </div>
                <div className="flex gap-3 text-sm">
                  <span className="text-[#f4a261] font-bold text-lg leading-none mt-0.5">!</span>
                  <span className="text-[#555577]">Could dive deeper into system design trade-offs.</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
