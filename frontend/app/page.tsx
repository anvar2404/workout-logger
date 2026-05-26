'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { Workout } from '@/lib/types'
import AuthGuard from '@/components/AuthGuard'
import { calcExerciseCalories, calcTotalCalories } from '@/lib/calories'

function maxWeight(workout: Workout) {
  return Math.max(...workout.exercises.flatMap((ex) => ex.sets.map((s) => s.weight)))
}

function HeroCard({ workout }: { workout: Workout }) {
  const date = new Date(workout.date).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  return (
    <div
      className="rounded-xl p-6 mb-5 anim-up"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--edge)',
        borderLeft: '3px solid var(--lime)',
      }}
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="font-data text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--smoke)' }}>
            Latest Session
          </p>
          <p className="font-data text-xs" style={{ color: 'var(--smoke)' }}>{date}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-data text-xs px-2 py-1 rounded" style={{ background: 'var(--lime-dim)', color: 'var(--lime)', border: '1px solid rgba(201,255,71,0.15)' }}>
            ~{calcTotalCalories(workout.exercises)} kcal
          </span>
          <span className="font-data text-xs px-2 py-1 rounded" style={{ background: 'var(--card-2)', color: 'var(--smoke)', border: '1px solid var(--edge-2)' }}>
            {workout.exercises.length} ex
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {workout.exercises.map((ex, i) => (
          <div key={i}>
            <p className="font-display text-2xl mb-2 leading-none" style={{ color: 'var(--iron)' }}>
              {ex.name.toUpperCase()}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {ex.sets.map((s, j) => (
                <span
                  key={j}
                  className="font-data text-sm px-3 py-1 rounded"
                  style={{
                    background: 'var(--card-2)',
                    border: '1px solid var(--edge-2)',
                    color: j === 0 ? 'var(--lime)' : 'var(--iron)',
                  }}
                >
                  {s.weight}<span style={{ color: 'var(--smoke)', fontSize: 11 }}>kg</span>
                  <span style={{ color: 'var(--smoke)', margin: '0 3px' }}>×</span>
                  {s.reps}
                </span>
              ))}
              <span className="font-data text-xs ml-1" style={{ color: 'var(--smoke)' }}>
                ~{calcExerciseCalories(ex.name, ex.sets)} kcal
              </span>
            </div>
          </div>
        ))}
      </div>

      {workout.notes && (
        <p className="mt-4 pt-4 text-sm" style={{ color: 'var(--smoke)', borderTop: '1px solid var(--edge)' }}>
          {workout.notes}
        </p>
      )}
    </div>
  )
}

function SmallCard({ workout }: { workout: Workout }) {
  const date = new Date(workout.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  const top = workout.exercises[0]
  const max = maxWeight(workout)

  return (
    <div className="session-card rounded-xl p-4 cursor-default">
      <div className="flex items-center justify-between mb-3">
        <span className="font-data text-xs" style={{ color: 'var(--smoke)' }}>{date}</span>
        <span className="font-data text-xs" style={{ color: 'var(--smoke)' }}>
          {workout.exercises.length} ex
        </span>
      </div>
      <p className="font-display text-xl leading-none mb-2" style={{ color: 'var(--iron)' }}>
        {top.name.toUpperCase()}
        {workout.exercises.length > 1 && (
          <span className="font-data text-xs ml-2" style={{ color: 'var(--smoke)', fontFamily: 'var(--font-jetbrains)' }}>
            +{workout.exercises.length - 1}
          </span>
        )}
      </p>
      <div className="flex items-baseline gap-3">
        <p className="font-data text-lg font-bold" style={{ color: 'var(--lime)' }}>
          {max}<span className="text-xs font-normal ml-0.5" style={{ color: 'var(--smoke)' }}>kg</span>
        </p>
        <p className="font-data text-sm" style={{ color: 'var(--smoke)' }}>
          ~{calcTotalCalories(workout.exercises)} kcal
        </p>
      </div>
    </div>
  )
}

function DashboardContent() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/workouts?limit=5')
      .then((r) => setWorkouts(r.data.workouts))
      .catch(() => setError('Could not load workouts'))
      .finally(() => setLoading(false))
  }, [])

  const today = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-20" style={{ color: 'var(--smoke)' }}>
        <span className="spin inline-block w-4 h-4 rounded-full border-2" style={{ borderColor: 'var(--lime)', borderTopColor: 'transparent' }} />
        <span className="font-data text-xs tracking-widest uppercase">Loading</span>
      </div>
    )
  }

  if (error) return <p className="font-data text-sm" style={{ color: 'var(--danger)' }}>{error}</p>

  if (workouts.length === 0) {
    return (
      <div className="py-24 text-center anim-in">
        <p className="font-display text-6xl mb-3" style={{ color: 'var(--edge-2)' }}>NO DATA</p>
        <p className="text-sm mb-6" style={{ color: 'var(--smoke)' }}>Start tracking your lifts</p>
        <Link href="/workouts/new" className="btn-lime px-6 py-2 rounded text-sm inline-block">
          LOG FIRST SESSION
        </Link>
      </div>
    )
  }

  const [hero, ...rest] = workouts

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-6 anim-up">
        <div>
          <p className="font-data text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--smoke)' }}>
            {today}
          </p>
          <h1 className="font-display text-4xl leading-none" style={{ color: 'var(--iron)' }}>
            SESSIONS
          </h1>
        </div>
        <span className="font-data text-xs px-3 py-1.5 rounded" style={{ background: 'var(--card)', border: '1px solid var(--edge)', color: 'var(--smoke)' }}>
          {workouts.length} recent
        </span>
      </div>

      {/* Hero card */}
      <HeroCard workout={hero} />

      {/* Grid of older sessions */}
      {rest.length > 0 && (
        <div className="grid grid-cols-2 gap-3 stagger">
          {rest.map((w) => <SmallCard key={w._id} workout={w} />)}
        </div>
      )}

      <div className="mt-6 text-center">
        <Link
          href="/workouts"
          className="font-data text-xs tracking-widest uppercase transition-colors"
          style={{ color: 'var(--smoke)' }}
        >
          View full history →
        </Link>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return <AuthGuard><DashboardContent /></AuthGuard>
}
