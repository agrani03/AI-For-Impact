"use client";

import { useEffect, useState, useRef } from "react";

interface ScoreRingProps {
  score: number;
  size?: number;
  color?: string;
  label?: string;
}

export default function ScoreRing({
  score,
  size = 120,
  color = "var(--accent)",
  label,
}: ScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [offset, setOffset] = useState(0);
  const mounted = useRef(false);

  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  /* Colour presets */
  const resolvedColor =
    color === "mint"
      ? "var(--mint)"
      : color === "danger"
      ? "var(--danger)"
      : color === "success"
      ? "var(--success)"
      : color === "warning"
      ? "var(--warning)"
      : color;

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    /* Animate dash offset */
    const target = circumference - (score / 100) * circumference;
    requestAnimationFrame(() => setOffset(target));

    /* Count-up number */
    const duration = 1500;
    const step = Math.ceil(duration / score || 1);
    let current = 0;
    const timer = setInterval(() => {
      current += 1;
      if (current >= score) {
        current = score;
        clearInterval(timer);
      }
      setDisplayScore(current);
    }, step);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e8e8f0"
          strokeWidth={strokeWidth}
        />
        {/* Score ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={resolvedColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1.5s ease-out",
          }}
        />
      </svg>
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span
          className="font-bold"
          style={{
            fontSize: size * 0.28,
            color: resolvedColor,
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          }}
        >
          {displayScore}
        </span>
        {label && (
          <span className="text-xs text-text-secondary mt-0.5">{label}</span>
        )}
      </div>
    </div>
  );
}
