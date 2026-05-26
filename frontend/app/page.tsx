'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { Workout } from '@/lib/types'
import AuthGuard from '@/components/AuthGuard'
import { calcTotalCalories } from '@/lib/calories'
import { calculateStreak, getMuscleGroup, getMuscleColor } from '@/lib/utils'

function totalVolume(workout: Workout) {
  return workout.exercises.reduce((acc, ex) =>
    acc + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0)
}

function StreakBadge({ streak }: { streak: number }) {
  if (streak < 2) return null
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'rgba(255,155,33,0.1)',
        border: '1px solid rgba(255,155,33,0.3)',
        borderRadius: 8,
        padding: '6px 12px',
      }}
    >
      <span style={{ fontSize: 16 }}>🔥</span>
      <div>
        <span style={{ fontFamily: 'var(--font-bebas)', fontSize: 22, color: 'var(--amber)', lineHeight: 1 }}>
          {streak}
        </span>
        <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 9, color: 'var(--amber)', letterSpacing: '0.08em', marginLeft: 4, opacity: 0.7 }}>
          DAY STREAK
        </span>
      </div>
    </div>
  )
}

function WorkoutCard({ workout, isLatest }: { workout: Workout; isLatest: boolean }) {
  const date = new Date(workout.date)
  const day = date.toLocaleDateString('en', { weekday: 'short' }).toUpperCase()
  const dateStr = date.toLocaleDateString('en', { month: 'short', day: 'numeric' })
  const vol = totalVolume(workout)
  const kcal = calcTotalCalories(workout.exercises)
  const muscles = [...new Set(workout.exercises.map((ex) => getMuscleGroup(ex.name)).filter((g) => g !== 'Other'))]

  return (
    <div
      className={isLatest ? 'anim-up' : ''}
      style={{
        background: 'var(--card)',
        border: `1px solid ${isLatest ? 'rgba(201,255,71,0.2)' : 'var(--edge)'}`,
        borderLeft: `3px solid ${isLatest ? 'var(--lime)' : 'var(--edge-2)'}`,
        borderRadius: 14,
        padding: isLatest ? '18px 16px' : '14px 14px',
        marginBottom: 10,
        transition: 'border-left-color 0.15s',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          {isLatest && (
            <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--lime)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
              Latest Session
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontFamily: 'var(--font-bebas)', fontSize: 20, color: 'var(--iron)', lineHeight: 1 }}>{day}</span>
            <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, color: 'var(--smoke)' }}>{dateStr}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 22, color: 'var(--lime)', lineHeight: 1 }}>
            {vol >= 1000 ? `${(vol / 1000).toFixed(1)}t` : `${vol}kg`}
          </div>
          <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 9, color: 'var(--smoke)', letterSpacing: '0.06em' }}>
            VOL · ~{kcal} KCAL
          </div>
        </div>
      </div>

      {/* Exercises */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {workout.exercises.slice(0, isLatest ? 4 : 2).map((ex, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: getMuscleColor(ex.name),
                flexShrink: 0,
              }}
            />
            <span style={{ fontFamily: 'var(--font-bebas)', fontSize: 16, color: 'var(--iron)', lineHeight: 1, flex: 1 }}>
              {ex.name}
            </span>
            <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, color: 'var(--smoke)' }}>
              {ex.sets.length}×{ex.sets.map((s) => s.reps).join('/')}
            </span>
          </div>
        ))}
        {workout.exercises.length > (isLatest ? 4 : 2) && (
          <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, color: 'var(--smoke-2)', paddingLeft: 14 }}>
            +{workout.exercises.length - (isLatest ? 4 : 2)} more
          </span>
        )}
      </div>

      {/* Muscle tags */}
      {isLatest && muscles.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 12 }}>
          {muscles.slice(0, 5).map((m) => (
            <span
              key={m}
              style={{
                fontFamily: 'var(--font-jetbrains)',
                fontSize: 9,
                letterSpacing: '0.06em',
                padding: '2px 7px',
                borderRadius: 4,
                background: `${getMuscleColor(m)}18`,
                border: `1px solid ${getMuscleColor(m)}40`,
                color: getMuscleColor(m),
                textTransform: 'uppercase',
              }}
            >
              {m}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function DashboardContent() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/workouts?limit=5').then((r) => setWorkouts(r.data.workouts)).finally(() => setLoading(false))
  }, [])

  const streak = calculateStreak(workouts)
  const todayStr = new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 80, color: 'var(--smoke)' }}>
        <span className="spin" style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--lime)', borderTopColor: 'transparent' }} />
        <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Loading</span>
      </div>
    )
  }

  if (workouts.length === 0) {
    return (
      <div className="anim-in" style={{ paddingTop: 60, textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 72, color: 'var(--edge-2)', lineHeight: 0.9, marginBottom: 16 }}>
          IRONLOG
        </div>
        <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 12, color: 'var(--smoke)', marginBottom: 32, letterSpacing: '0.06em' }}>
          Your training journal starts here
        </p>
        <Link
          href="/workouts/new"
          className="btn-lime"
          style={{ display: 'inline-block', padding: '14px 36px', borderRadius: 12, fontSize: 18, letterSpacing: '0.06em', textDecoration: 'none' }}
        >
          START FIRST SESSION
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="anim-up" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--smoke)', textTransform: 'uppercase', marginBottom: 2 }}>
              {todayStr}
            </p>
            <h1 style={{ fontFamily: 'var(--font-bebas)', fontSize: 42, color: 'var(--iron)', lineHeight: 0.95, letterSpacing: '0.02em' }}>
              IRONLOG
            </h1>
          </div>
          <StreakBadge streak={streak} />
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/workouts/new"
        className="btn-lime anim-up"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          padding: '16px',
          borderRadius: 14,
          fontSize: 20,
          letterSpacing: '0.06em',
          textDecoration: 'none',
          marginBottom: 24,
          animationDelay: '40ms',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        START SESSION
      </Link>

      {/* Recent sessions */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--smoke)', textTransform: 'uppercase' }}>
            Recent Sessions
          </span>
          <Link href="/workouts" style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, color: 'var(--smoke)', textDecoration: 'none', letterSpacing: '0.06em' }}>
            View all →
          </Link>
        </div>
        {workouts.map((w, i) => (
          <WorkoutCard key={w._id} workout={w} isLatest={i === 0} />
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  return <AuthGuard><DashboardContent /></AuthGuard>
}
