'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { Workout } from '@/lib/types'
import AuthGuard from '@/components/AuthGuard'
import { calcExerciseCalories, calcTotalCalories } from '@/lib/calories'

function WorkoutsHistoryContent() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [removing, setRemoving] = useState<string | null>(null)

  const load = (p: number) => {
    setLoading(true)
    api
      .get(`/workouts?page=${p}&limit=10`)
      .then((r) => {
        setWorkouts(r.data.workouts)
        setPages(r.data.pages)
        setPage(p)
        setTotal(r.data.total)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(1) }, [])

  const remove = async (id: string) => {
    setRemoving(id)
    try {
      await api.delete(`/workouts/${id}`)
      load(page)
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-8 anim-up">
        <div>
          <p className="font-data text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--smoke)' }}>
            All time
          </p>
          <h1 className="font-display text-4xl leading-none" style={{ color: 'var(--iron)' }}>
            HISTORY
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {total > 0 && (
            <span className="font-data text-xs px-3 py-1.5 rounded" style={{ background: 'var(--card)', border: '1px solid var(--edge)', color: 'var(--smoke)' }}>
              {total} sessions
            </span>
          )}
          <Link href="/workouts/new" className="btn-lime px-4 py-1.5 rounded text-sm">
            + LOG
          </Link>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-3 py-10" style={{ color: 'var(--smoke)' }}>
          <span className="spin inline-block w-4 h-4 rounded-full border-2" style={{ borderColor: 'var(--lime)', borderTopColor: 'transparent' }} />
          <span className="font-data text-xs tracking-widest uppercase">Loading</span>
        </div>
      )}

      {!loading && workouts.length === 0 && (
        <div className="py-24 text-center anim-in">
          <p className="font-display text-6xl mb-3" style={{ color: 'var(--edge-2)' }}>EMPTY</p>
          <p className="text-sm mb-6" style={{ color: 'var(--smoke)' }}>No sessions logged yet</p>
          <Link href="/workouts/new" className="btn-lime px-6 py-2 rounded text-sm inline-block">
            LOG FIRST SESSION
          </Link>
        </div>
      )}

      <div className="space-y-3 stagger">
        {workouts.map((w) => {
          const date = new Date(w.date).toLocaleDateString('ru-RU', {
            day: 'numeric', month: 'long', year: 'numeric',
          })
          return (
            <div key={w._id} className="session-card rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-data text-xs" style={{ color: 'var(--smoke)' }}>{date}</span>
                  <span className="font-data text-xs px-2 py-0.5 rounded" style={{ background: 'var(--lime-dim)', color: 'var(--lime)', border: '1px solid rgba(201,255,71,0.15)' }}>
                    ~{calcTotalCalories(w.exercises)} kcal
                  </span>
                </div>
                <button
                  onClick={() => remove(w._id)}
                  disabled={removing === w._id}
                  className="font-data text-xs tracking-widest uppercase transition-colors"
                  style={{ color: 'var(--smoke-2)' } as React.CSSProperties}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--smoke-2)')}
                >
                  {removing === w._id ? '...' : 'DELETE'}
                </button>
              </div>

              <div className="space-y-3">
                {w.exercises.map((ex, i) => (
                  <div key={i} className="flex items-baseline gap-3">
                    <span className="font-display text-xl leading-none shrink-0" style={{ color: 'var(--iron)' }}>
                      {ex.name.toUpperCase()}
                    </span>
                    <span className="font-data text-xs" style={{ color: 'var(--smoke)' }}>
                      {ex.sets.map((s) => `${s.weight}×${s.reps}`).join('  ')}
                    </span>
                    <span className="font-data text-xs ml-auto shrink-0" style={{ color: 'var(--smoke-2)' }}>
                      ~{calcExerciseCalories(ex.name, ex.sets)} kcal
                    </span>
                  </div>
                ))}
              </div>

              {w.notes && (
                <p className="mt-3 pt-3 text-sm" style={{ color: 'var(--smoke)', borderTop: '1px solid var(--edge)' }}>
                  {w.notes}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            onClick={() => load(page - 1)}
            disabled={page === 1}
            className="btn-ghost font-data text-xs tracking-widest uppercase px-4 py-2 rounded disabled:opacity-20"
          >
            ← PREV
          </button>
          <span className="font-data text-xs" style={{ color: 'var(--smoke)' }}>
            {page} / {pages}
          </span>
          <button
            onClick={() => load(page + 1)}
            disabled={page === pages}
            className="btn-ghost font-data text-xs tracking-widest uppercase px-4 py-2 rounded disabled:opacity-20"
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
