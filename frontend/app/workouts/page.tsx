'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { Workout } from '@/lib/types'
import AuthGuard from '@/components/AuthGuard'
import { calcTotalCalories } from '@/lib/calories'
import { getMuscleColor, getMuscleGroup } from '@/lib/utils'

function sessionVolume(workout: Workout) {
  return workout.exercises.reduce((acc, ex) => acc + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0)
}

function WorkoutRow({ workout, onDelete, deleting }: { workout: Workout; onDelete: () => void; deleting: boolean }) {
  const date = new Date(workout.date)
  const day = date.toLocaleDateString('en', { weekday: 'short' }).toUpperCase()
  const dateStr = date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
  const vol = sessionVolume(workout)
  const kcal = calcTotalCalories(workout.exercises)
  const muscles = [...new Set(workout.exercises.map((ex) => getMuscleGroup(ex.name)).filter((g) => g !== 'Other'))]

  return (
    <div
      className="session-card"
      style={{ borderRadius: 14, padding: '14px', marginBottom: 10 }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-bebas)', fontSize: 22, color: 'var(--iron)', lineHeight: 1 }}>{day}</span>
          <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, color: 'var(--smoke)' }}>{dateStr}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontFamily: 'var(--font-bebas)', fontSize: 18, color: 'var(--lime)' }}>
              {vol >= 1000 ? `${(vol / 1000).toFixed(1)}t` : `${vol}kg`}
            </span>
            <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 9, color: 'var(--smoke)', marginLeft: 5 }}>
              ~{kcal} kcal
            </span>
          </div>
          <button
            onClick={onDelete}
            disabled={deleting}
            style={{
              fontFamily: 'var(--font-jetbrains)',
              fontSize: 9,
              letterSpacing: '0.08em',
              color: 'var(--smoke-2)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--smoke-2)')}
          >
            {deleting ? '...' : 'DEL'}
          </button>
        </div>
      </div>

      {/* Exercises */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10 }}>
        {workout.exercises.map((ex, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: getMuscleColor(ex.name), flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-bebas)', fontSize: 16, color: 'var(--iron)', lineHeight: 1, flex: 1 }}>
              {ex.name}
            </span>
            <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, color: 'var(--smoke)' }}>
              {ex.sets.map((s) => `${s.weight}×${s.reps}`).join('  ')}
            </span>
          </div>
        ))}
      </div>

      {/* Muscle tags */}
      {muscles.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {muscles.slice(0, 5).map((m) => (
            <span
              key={m}
              style={{
                fontFamily: 'var(--font-jetbrains)',
                fontSize: 9,
                letterSpacing: '0.05em',
                padding: '2px 6px',
                borderRadius: 4,
                background: `${getMuscleColor(m)}15`,
                border: `1px solid ${getMuscleColor(m)}35`,
                color: getMuscleColor(m),
                textTransform: 'uppercase',
              }}
            >
              {m}
            </span>
          ))}
        </div>
      )}

      {workout.notes && (
        <p style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--edge)', fontFamily: 'var(--font-dm)', fontSize: 12, color: 'var(--smoke)' }}>
          {workout.notes}
        </p>
      )}
    </div>
  )
}

function WorkoutsHistoryContent() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [removing, setRemoving] = useState<string | null>(null)

  const load = (p: number) => {
    setLoading(true)
    api.get(`/workouts?page=${p}&limit=10`).then((r) => {
      setWorkouts(r.data.workouts)
      setPages(r.data.pages)
      setPage(p)
      setTotal(r.data.total)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load(1) }, [])

  const remove = async (id: string) => {
    setRemoving(id)
    try { await api.delete(`/workouts/${id}`); load(page) }
    finally { setRemoving(null) }
  }

  return (
    <div>
      {/* Header */}
      <div className="anim-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
        <div>
          <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--smoke)', textTransform: 'uppercase', marginBottom: 2 }}>
            All time
          </p>
          <h1 style={{ fontFamily: 'var(--font-bebas)', fontSize: 42, color: 'var(--iron)', lineHeight: 0.95, letterSpacing: '0.02em' }}>
            HISTORY
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {total > 0 && (
            <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, color: 'var(--smoke)', background: 'var(--card)', border: '1px solid var(--edge)', borderRadius: 8, padding: '5px 10px' }}>
              {total} sessions
            </span>
          )}
          <Link
            href="/workouts/new"
            className="btn-lime"
            style={{ padding: '8px 16px', borderRadius: 10, fontSize: 16, letterSpacing: '0.05em', textDecoration: 'none' }}
          >
            + LOG
          </Link>
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '40px 0', color: 'var(--smoke)' }}>
          <span className="spin" style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--lime)', borderTopColor: 'transparent' }} />
          <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Loading</span>
        </div>
      )}

      {!loading && workouts.length === 0 && (
        <div className="anim-in" style={{ paddingTop: 60, textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-bebas)', fontSize: 60, color: 'var(--edge-2)' }}>EMPTY</p>
          <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 12, color: 'var(--smoke)', marginBottom: 28 }}>No sessions logged yet</p>
          <Link href="/workouts/new" className="btn-lime" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: 12, fontSize: 18, textDecoration: 'none', letterSpacing: '0.05em' }}>
            LOG SESSION
          </Link>
        </div>
      )}

      <div className="stagger">
        {workouts.map((w) => (
          <WorkoutRow
            key={w._id}
            workout={w}
            onDelete={() => remove(w._id)}
            deleting={removing === w._id}
          />
        ))}
      </div>

      {pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 24 }}>
          <button
            onClick={() => load(page - 1)}
            disabled={page === 1}
            className="btn-ghost"
            style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 16px', borderRadius: 8 }}
          >
            ← PREV
          </button>
          <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, color: 'var(--smoke)' }}>
            {page} / {pages}
          </span>
          <button
            onClick={() => load(page + 1)}
            disabled={page === pages}
            className="btn-ghost"
            style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 16px', borderRadius: 8 }}
          >
            NEXT →
          </button>
        </div>
      )}
    </div>
  )
}

export default function WorkoutsHistory() {
  return <AuthGuard><WorkoutsHistoryContent /></AuthGuard>
}
