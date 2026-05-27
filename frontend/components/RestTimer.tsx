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
  const isLow = remaining <= 5

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const display = mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}`

  return (
    <div className="rest-timer-overlay" onClick={onSkip}>
      <div className="anim-slide-up" style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>

        <div style={{ background: 'var(--surface)', borderRadius: 24, padding: '36px 40px', boxShadow: 'var(--shadow-lg)', maxWidth: 300 }}>
          <p style={{ fontFamily: 'var(--font-dm)', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-2)', marginBottom: 28, textTransform: 'uppercase' }}>
            Rest Timer
          </p>

          <div style={{ position: 'relative', width: 192, height: 192, margin: '0 auto 28px' }}>
            <svg width="192" height="192" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="96" cy="96" r={radius} fill="none" stroke="var(--border)" strokeWidth="5" />
              <circle
                cx="96" cy="96" r={radius} fill="none"
                stroke={isLow ? 'var(--danger)' : 'var(--accent)'}
                strokeWidth="5" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span
                className={isLow ? 'timer-pulse' : ''}
                style={{ fontFamily: 'var(--font-bebas)', fontSize: remaining > 60 ? 56 : 68, lineHeight: 1, color: isLow ? 'var(--danger)' : 'var(--text)', letterSpacing: '0.02em' }}
              >
                {display}
              </span>
              <span style={{ fontFamily: 'var(--font-dm)', fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>seconds</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button
              onClick={() => addTime(15)}
              className="btn-ghost"
              style={{ padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              +15s
            </button>
            <button
              onClick={() => addTime(30)}
              className="btn-ghost"
              style={{ padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              +30s
            </button>
            <button
              onClick={onSkip}
              className="btn-accent"
              style={{ padding: '9px 20px', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}
            >
              Skip
            </button>
          </div>

          <p style={{ marginTop: 16, fontFamily: 'var(--font-dm)', fontSize: 11, color: 'var(--text-3)' }}>
            tap outside to skip
          </p>
        </div>
      </div>
    </div>
  )
}
