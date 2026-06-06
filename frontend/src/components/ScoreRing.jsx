import { useEffect, useState, useRef } from 'react'

export default function ScoreRing({ score, size = 120, color = 'var(--accent)', label }) {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const [displayScore, setDisplayScore] = useState(0)
  const [offset, setOffset] = useState(circumference)

  /* Colour presets */
  const resolvedColor =
    color === 'mint' ? 'var(--mint)'
    : color === 'danger' ? 'var(--danger)'
    : color === 'success' ? 'var(--success)'
    : color === 'warning' ? 'var(--warning)'
    : color

  useEffect(() => {
    const finalScore = score || 0
    const target = circumference - (finalScore / 100) * circumference
    const t1 = setTimeout(() => setOffset(target), 50)

    const duration = 1500
    const step = Math.ceil(duration / (finalScore || 1))
    let current = 0
    const timer = setInterval(() => {
      current += 1
      if (current >= finalScore) {
        current = finalScore
        clearInterval(timer)
      }
      setDisplayScore(current)
    }, step)

    return () => {
      clearTimeout(t1)
      clearInterval(timer)
    }
  }, [score, circumference])

  return (
    <div className="flex flex-col items-center gap-1" style={{ position: 'relative' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#e8e8f0" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={resolvedColor} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: size, height: size,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <span style={{
          fontSize: size * 0.28,
          fontWeight: 700,
          color: resolvedColor,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {displayScore}
        </span>
        {label && (
          <span className="text-xs text-text-secondary" style={{ marginTop: 2 }}>{label}</span>
        )}
      </div>
    </div>
  )
}
