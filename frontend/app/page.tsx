'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { Workout } from '@/lib/types'
import AuthGuard from '@/components/AuthGuard'
import { calcTotalCalories } from '@/lib/calories'
import { calculateStreak, getMuscleColor, getMuscleGroup } from '@/lib/utils'

function totalVolume(workout: Workout) {
  return workout.exercises.reduce((acc, ex) =>
    acc + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0)
}

function WorkoutCard({ workout, isLatest }: { workout: Workout; isLatest: boolean }) {
  const date = new Date(workout.date)
  const day = date.toLocaleDateString('en', { weekday: 'short' })
  const dateStr = date.toLocaleDateString('en', { month: 'short', day: 'numeric' })
  const vol = totalVolume(workout)
  const kcal = calcTotalCalories(workout.exercises)
  const muscles = [...new Set(workout.exercises.map((ex) => getMuscleGroup(ex.name)).filter((g) => g !== 'Other'))]

  return (
    <div
      className="card anim-up"
      style={{
        padding: '16px',
        marginBottom: 10,
        borderLeft: isLatest ? '3px solid var(--accent)' : '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          {isLatest && (
            <span style={{ fontFamily: 'var(--font-dm)', fontSize: 10, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 3 }}>
              Latest
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontFamily: 'var(--font-dm)', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{day}</span>
            <span style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: 'var(--text-2)' }}>{dateStr}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>
            {vol >= 1000 ? `${(vol / 1000).toFixed(1)}t` : `${vol}kg`}
          </div>
          <div style={{ fontFamily: 'var(--font-dm)', fontSize: 11, color: 'var(--text-3)' }}>~{kcal} kcal</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10 }}>
        {workout.exercises.slice(0, isLatest ? 4 : 2).map((ex, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: getMuscleColor(ex.name), flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-dm)', fontSize: 14, fontWeight: 500, color: 'var(--text)', flex: 1 }}>
              {ex.name}
            </span>
            <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, color: 'var(--text-3)' }}>
              {ex.sets.length} sets
            </span>
          </div>
        ))}
        {workout.exercises.length > (isLatest ? 4 : 2) && (
          <span style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: 'var(--text-3)', paddingLeft: 15 }}>
            +{workout.exercises.length - (isLatest ? 4 : 2)} more
          </span>
        )}
      </div>

      {isLatest && muscles.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {muscles.slice(0, 5).map((m) => (
            <span key={m} style={{
              fontFamily: 'var(--font-dm)', fontSize: 10, fontWeight: 500,
              padding: '2px 8px', borderRadius: 999,
              background: `${getMuscleColor(m)}18`, border: `1px solid ${getMuscleColor(m)}40`,
              color: getMuscleColor(m),
            }}>
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
    api.get('/workouts?limit=6').then((r) => setWorkouts(r.data.workouts)).finally(() => setLoading(false))
  }, [])

  const streak = calculateStreak(workouts)
  const todayStr = new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 60, color: 'var(--text-3)' }}>
        <span className="spin" style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent' }} />
        <span style={{ fontFamily: 'var(--font-dm)', fontSize: 13 }}>Loading...</span>
      </div>
    )
  }

  if (workouts.length === 0) {
    return (
      <div className="anim-in" style={{ paddingTop: 60, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, background: 'var(--accent-light)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M6 4v16M18 4v16M6 12h12M3 8h3M18 8h3M3 16h3M18 16h3" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h2 style={{ fontFamily: 'var(--font-dm)', fontWeight: 700, fontSize: 20, color: 'var(--text)', marginBottom: 8 }}>No workouts yet</h2>
        <p style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: 'var(--text-2)', marginBottom: 28 }}>Start tracking your lifts today</p>
        <Link href="/workouts/new" className="btn-accent" style={{ display: 'inline-block', padding: '13px 32px', borderRadius: 12, fontSize: 15, textDecoration: 'none' }}>
          Start First Session
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="anim-up" style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>{todayStr}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-dm)', fontWeight: 800, fontSize: 26, color: 'var(--text)', margin: 0 }}>Dashboard</h1>
          {streak >= 2 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--amber-light)', border: '1px solid rgba(217,119,6,0.2)', borderRadius: 10, padding: '5px 10px' }}>
              <span style={{ fontSize: 14 }}>🔥</span>
              <span style={{ fontFamily: 'var(--font-dm)', fontWeight: 700, fontSize: 14, color: 'var(--amber)' }}>{streak} day streak</span>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <Link href="/workouts/new" className="btn-accent anim-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '15px', borderRadius: 14, fontSize: 15, fontWeight: 600, textDecoration: 'none', marginBottom: 28, animationDelay: '40ms' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        Start Session
      </Link>

      {/* Recent */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontFamily: 'var(--font-dm)', fontWeight: 600, fontSize: 14, color: 'var(--text-2)' }}>Recent Sessions</span>
        <Link href="/workouts" style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>View all</Link>
      </div>

      {workouts.map((w, i) => <WorkoutCard key={w._id} workout={w} isLatest={i === 0} />)}
    </div>
  )
}

export default function Dashboard() {
  return <AuthGuard><DashboardContent /></AuthGuard>
}
