'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { Workout } from '@/lib/types'
import AuthGuard from '@/components/AuthGuard'
import { calcTotalCalories } from '@/lib/calories'
import { getMuscleColor, getMuscleGroup } from '@/lib/utils'

function totalVolume(workout: Workout) {
  return workout.exercises.reduce((acc, ex) => acc + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0)
}

function WorkoutRow({ workout, onDelete, deleting }: { workout: Workout; onDelete: () => void; deleting: boolean }) {
  const date = new Date(workout.date)
  const day = date.toLocaleDateString('en', { weekday: 'long' })
  const dateStr = date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
  const vol = totalVolume(workout)
  const kcal = calcTotalCalories(workout.exercises)
  const muscles = [...new Set(workout.exercises.map((ex) => getMuscleGroup(ex.name)).filter((g) => g !== 'Other'))]

  return (
    <div className="card" style={{ padding: '16px', marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-dm)', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{day}</div>
          <div style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: 'var(--text-3)', marginTop: 1 }}>{dateStr}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
              {vol >= 1000 ? `${(vol / 1000).toFixed(1)}t` : `${vol}kg`}
            </div>
            <div style={{ fontFamily: 'var(--font-dm)', fontSize: 11, color: 'var(--text-3)' }}>~{kcal} kcal</div>
          </div>
          <button
            onClick={onDelete}
            disabled={deleting}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4, transition: 'color 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-3)')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10 }}>
        {workout.exercises.map((ex, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: getMuscleColor(ex.name), flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-dm)', fontSize: 13, fontWeight: 500, color: 'var(--text)', flex: 1 }}>{ex.name}</span>
            <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, color: 'var(--text-3)' }}>
              {ex.sets.map((s) => `${s.weight}×${s.reps}`).join('  ')}
            </span>
          </div>
        ))}
      </div>

      {muscles.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {muscles.slice(0, 5).map((m) => (
            <span key={m} style={{ fontFamily: 'var(--font-dm)', fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 999, background: `${getMuscleColor(m)}15`, border: `1px solid ${getMuscleColor(m)}35`, color: getMuscleColor(m) }}>
              {m}
            </span>
          ))}
        </div>
      )}

      {workout.notes && (
        <p style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', fontFamily: 'var(--font-dm)', fontSize: 12, color: 'var(--text-2)' }}>
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
      <div className="anim-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-dm)', fontWeight: 800, fontSize: 26, color: 'var(--text)', margin: 0 }}>History</h1>
          {total > 0 && <p style={{ fontFamily: 'var(--font-dm)', fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>{total} sessions logged</p>}
        </div>
        <Link href="/workouts/new" className="btn-accent" style={{ padding: '9px 18px', borderRadius: 10, fontSize: 14, textDecoration: 'none' }}>
          + Log
        </Link>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '40px 0', color: 'var(--text-3)' }}>
          <span className="spin" style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent' }} />
          <span style={{ fontFamily: 'var(--font-dm)', fontSize: 13 }}>Loading...</span>
        </div>
      )}

      {!loading && workouts.length === 0 && (
        <div className="anim-in" style={{ paddingTop: 60, textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-dm)', fontWeight: 700, fontSize: 18, color: 'var(--text)', marginBottom: 8 }}>No sessions yet</p>
          <p style={{ fontFamily: 'var(--font-dm)', fontSize: 14, color: 'var(--text-2)', marginBottom: 24 }}>Log your first workout to get started</p>
          <Link href="/workouts/new" className="btn-accent" style={{ display: 'inline-block', padding: '11px 28px', borderRadius: 12, fontSize: 14, textDecoration: 'none' }}>
            Log Session
          </Link>
        </div>
      )}

      <div className="stagger">
        {workouts.map((w) => (
          <WorkoutRow key={w._id} workout={w} onDelete={() => remove(w._id)} deleting={removing === w._id} />
        ))}
      </div>

      {pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 24 }}>
          <button onClick={() => load(page - 1)} disabled={page === 1} className="btn-ghost" style={{ padding: '8px 16px', borderRadius: 9, fontSize: 13, cursor: 'pointer' }}>← Prev</button>
          <span style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'var(--text-2)' }}>{page} / {pages}</span>
          <button onClick={() => load(page + 1)} disabled={page === pages} className="btn-ghost" style={{ padding: '8px 16px', borderRadius: 9, fontSize: 13, cursor: 'pointer' }}>Next →</button>
        </div>
      )}
    </div>
  )
}

export default function WorkoutsHistory() {
  return <AuthGuard><WorkoutsHistoryContent /></AuthGuard>
}
