'use client'

import { useEffect, useRef, useState } from 'react'

interface RestTimerProps {
  seconds: number
  onDone: () => void
  onSkip: () => void
}

export default function RestTimer({ seconds, onDone, onSkip }: RestTimerProps) {
  const [remaining, setRemaining] = useState(seconds)
  const total = useRef(seconds)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setRemaining(seconds)
    total.current = seconds
  }, [seconds])

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current!)
          onDone()
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current!)
  }, [onDone])

  const addTime = (extra: number) => {
    setRemaining((r) => r + extra)
    total.current = total.current + extra
  }

  const radius = 72
  const circumference = 2 * Math.PI * radius
  const progress = remaining / total.current
  const dashOffset = circumference * (1 - progress)

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const display = mins > 0
    ? `${mins}:${String(secs).padStart(2, '0')}`
    : `${secs}`

  return (
    <div className="rest-timer-overlay" onClick={onSkip}>
      <div
        className="anim-slide-up"
        style={{ textAlign: 'center' }}
        onClick={(e) => e.stopPropagation()}
      >
        <p
          style={{
            fontFamily: 'var(--font-jetbrains), monospace',
            fontSize: 11,
            letterSpacing: '0.15em',
            color: 'var(--smoke)',
            marginBottom: 32,
            textTransform: 'uppercase',
          }}
        >
          Rest
        </p>

        {/* SVG circle */}
        <div style={{ position: 'relative', width: 192, height: 192, margin: '0 auto 32px' }}>
          <svg width="192" height="192" style={{ transform: 'rotate(-90deg)' }}>
            {/* Track */}
            <circle
              cx="96" cy="96" r={radius}
              fill="none"
              stroke="var(--edge-2)"
              strokeWidth="4"
            />
            {/* Progress */}
            <circle
              cx="96" cy="96" r={radius}
              fill="none"
              stroke={remaining <= 5 ? 'var(--danger)' : 'var(--lime)'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }}
            />
          </svg>
          {/* Timer text */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              className={remaining <= 5 ? 'timer-pulse' : ''}
              style={{
                fontFamily: 'var(--font-bebas), sans-serif',
                fontSize: remaining > 60 ? 52 : 64,
                lineHeight: 1,
                color: remaining <= 5 ? 'var(--danger)' : 'var(--iron)',
                letterSpacing: '0.02em',
              }}
            >
              {display}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-jetbrains), monospace',
                fontSize: 10,
                color: 'var(--smoke)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginTop: 4,
              }}
            >
              sec
            </span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={() => addTime(15)}
            style={{
              fontFamily: 'var(--font-jetbrains), monospace',
              fontSize: 12,
              letterSpacing: '0.08em',
              color: 'var(--smoke)',
              background: 'var(--card)',
              border: '1px solid var(--edge-2)',
              borderRadius: 10,
              padding: '10px 18px',
              cursor: 'pointer',
              transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--iron)'; e.currentTarget.style.borderColor = 'var(--edge)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--smoke)'; e.currentTarget.style.borderColor = 'var(--edge-2)' }}
          >
            +15S
          </button>
          <button
            onClick={() => addTime(30)}
            style={{
              fontFamily: 'var(--font-jetbrains), monospace',
              fontSize: 12,
              letterSpacing: '0.08em',
              color: 'var(--smoke)',
              background: 'var(--card)',
              border: '1px solid var(--edge-2)',
              borderRadius: 10,
              padding: '10px 18px',
              cursor: 'pointer',
              transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--iron)'; e.currentTarget.style.borderColor = 'var(--edge)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--smoke)'; e.currentTarget.style.borderColor = 'var(--edge-2)' }}
          >
            +30S
          </button>
          <button
            onClick={onSkip}
            style={{
              fontFamily: 'var(--font-bebas), sans-serif',
              fontSize: 16,
              letterSpacing: '0.06em',
              color: 'var(--void)',
              background: 'var(--lime)',
              border: 'none',
              borderRadius: 10,
              padding: '10px 24px',
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
          >
            SKIP
          </button>
        </div>

        <p
          style={{
            marginTop: 20,
            fontFamily: 'var(--font-jetbrains), monospace',
            fontSize: 10,
            color: 'var(--smoke-2)',
            letterSpacing: '0.05em',
          }}
        >
          tap outside to skip
        </p>
      </div>
    </div>
  )
}
