'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Exercise, Set } from '@/lib/types'
import AuthGuard from '@/components/AuthGuard'
import { calcExerciseCalories, calcTotalCalories } from '@/lib/calories'

const EXERCISES = [
  // Грудь
  'Bench Press', 'Incline Bench Press', 'Decline Bench Press',
  'Dumbbell Fly', 'Cable Crossover', 'Push-up', 'Dips',
  // Спина
  'Deadlift', 'Pull-up', 'Chin-up', 'Barbell Row', 'Dumbbell Row',
  'Lat Pulldown', 'Seated Cable Row', 'T-Bar Row', 'Face Pull',
  // Плечи
  'Overhead Press', 'Dumbbell Shoulder Press', 'Lateral Raise',
  'Front Raise', 'Rear Delt Fly', 'Arnold Press', 'Shrug',
  // Ноги
  'Squat', 'Front Squat', 'Leg Press', 'Romanian Deadlift',
  'Leg Curl', 'Leg Extension', 'Calf Raise', 'Bulgarian Split Squat',
  'Hip Thrust', 'Sumo Deadlift',
  // Бицепс
  'Barbell Curl', 'Dumbbell Curl', 'Hammer Curl', 'Preacher Curl',
  'Cable Curl', 'Concentration Curl',
  // Трицепс
  'Tricep Pushdown', 'Skull Crusher', 'Overhead Tricep Extension',
  'Close-Grip Bench Press', 'Tricep Kickback', 'Diamond Push-up',
  // Кор / другое
  'Plank', 'Ab Wheel', 'Hanging Leg Raise', 'Russian Twist',
  'Cable Crunch', 'Farmer Walk',
]

function ExerciseSearch({
  value,
  onChange,
}: {
  value: string
  onChange: (name: string) => void
}) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const filtered = query.trim()
    ? EXERCISES.filter((e) => e.toLowerCase().includes(query.toLowerCase()))
    : EXERCISES

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (name: string) => {
    onChange(name)
    setQuery(name)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative flex-1">
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder="Search exercise..."
        className="font-display text-2xl w-full rounded-lg px-4 py-2.5 leading-none"
        style={{
          background: 'var(--card-2)',
          border: '1px solid var(--edge-2)',
          color: 'var(--iron)',
          letterSpacing: '0.03em',
        }}
      />

      {open && filtered.length > 0 && (
        <div
          className="absolute left-0 right-0 top-full mt-1 rounded-xl overflow-hidden z-50"
          style={{
            background: 'var(--card-2)',
            border: '1px solid var(--edge-2)',
            maxHeight: 280,
            overflowY: 'auto',
          }}
        >
          {filtered.map((name) => (
            <button
              key={name}
              onMouseDown={() => select(name)}
              className="w-full text-left px-4 py-3 font-display text-xl transition-colors"
              style={{
                color: name === value ? 'var(--lime)' : 'var(--iron)',
                background: 'transparent',
                borderBottom: '1px solid var(--edge)',
                letterSpacing: '0.03em',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--edge)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {name}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-3 font-data text-sm" style={{ color: 'var(--smoke)' }}>
              No matches
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SetRow({
  set, index, onChange, onRemove,
}: {
  set: Set; index: number
  onChange: (field: keyof Set, value: number) => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-data text-sm w-6 text-right shrink-0" style={{ color: 'var(--smoke)' }}>
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={set.weight || ''}
          onChange={(e) => onChange('weight', parseFloat(e.target.value) || 0)}
          placeholder="0"
          className="font-data text-base rounded-lg px-4 py-3 w-28 text-center"
          style={{ background: 'var(--card-2)', border: '1px solid var(--edge-2)', color: 'var(--iron)' }}
        />
        <span className="font-data text-sm shrink-0" style={{ color: 'var(--smoke)' }}>kg</span>
      </div>
      <span className="font-data text-base" style={{ color: 'var(--smoke-2)' }}>×</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={set.reps || ''}
          onChange={(e) => onChange('reps', parseInt(e.target.value) || 0)}
          placeholder="0"
          className="font-data text-base rounded-lg px-4 py-3 w-24 text-center"
          style={{ background: 'var(--card-2)', border: '1px solid var(--edge-2)', color: 'var(--iron)' }}
        />
        <span className="font-data text-sm shrink-0" style={{ color: 'var(--smoke)' }}>rep</span>
      </div>
      <button
        onClick={onRemove}
        className="font-data text-lg ml-auto transition-colors"
        style={{ color: 'var(--smoke-2)' } as React.CSSProperties}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--smoke-2)')}
      >
        ×
      </button>
    </div>
  )
}

function NewWorkoutForm() {
  const router = useRouter()
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: 'Bench Press', sets: [{ reps: 0, weight: 0 }] },
  ])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const addExercise = () =>
    setExercises((prev) => [...prev, { name: EXERCISES[0], sets: [{ reps: 0, weight: 0 }] }])

  const removeExercise = (ei: number) =>
    setExercises((prev) => prev.filter((_, i) => i !== ei))

  const updateExerciseName = (ei: number, name: string) =>
    setExercises((prev) => prev.map((ex, i) => (i === ei ? { ...ex, name } : ex)))

  const addSet = (ei: number) =>
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === ei ? { ...ex, sets: [...ex.sets, { reps: 0, weight: 0 }] } : ex
      )
    )

  const updateSet = (ei: number, si: number, field: keyof Set, value: number) =>
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === ei
          ? { ...ex, sets: ex.sets.map((s, j) => (j === si ? { ...s, [field]: value } : s)) }
          : ex
      )
    )

  const removeSet = (ei: number, si: number) =>
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === ei ? { ...ex, sets: ex.sets.filter((_, j) => j !== si) } : ex
      )
    )

  const save = async () => {
    setError('')
    const valid = exercises.every(
      (ex) => ex.name && ex.sets.length > 0 && ex.sets.every((s) => s.reps > 0 && s.weight >= 0)
    )
    if (!valid) { setError('Fill in all sets before saving'); return }
    try {
      setSaving(true)
      await api.post('/workouts', { exercises, notes })
      router.push('/')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-10 anim-up flex items-end justify-between">
        <div>
          <p className="font-data text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--smoke)' }}>New</p>
          <h1 className="font-display text-5xl leading-none" style={{ color: 'var(--iron)' }}>LOG SESSION</h1>
        </div>
        {calcTotalCalories(exercises) > 0 && (
          <div className="text-right">
            <p className="font-data text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--smoke)' }}>Est. total</p>
            <p className="font-data text-2xl font-bold" style={{ color: 'var(--lime)' }}>
              ~{calcTotalCalories(exercises)}<span className="text-sm font-normal ml-1" style={{ color: 'var(--smoke)' }}>kcal</span>
            </p>
          </div>
        )}
      </div>

      <div className="space-y-5 stagger">
        {exercises.map((ex, ei) => (
          <div
            key={ei}
            className="rounded-xl p-7"
            style={{ background: 'var(--card)', border: '1px solid var(--edge)', borderLeft: '3px solid var(--lime)' }}
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="font-display text-3xl leading-none shrink-0" style={{ color: 'var(--smoke)' }}>
                {String(ei + 1).padStart(2, '0')}
              </span>
              <ExerciseSearch
                value={ex.name}
                onChange={(name) => updateExerciseName(ei, name)}
              />
              {exercises.length > 1 && (
                <button
                  onClick={() => removeExercise(ei)}
                  className="font-data text-xs tracking-widest uppercase shrink-0 transition-colors"
                  style={{ color: 'var(--smoke-2)' } as React.CSSProperties}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--smoke-2)')}
                >
                  REMOVE
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 mb-3 pl-10">
              <span className="font-data text-xs w-28 text-center" style={{ color: 'var(--smoke-2)' }}>WEIGHT</span>
              <span className="w-6" />
              <span className="font-data text-xs w-24 text-center" style={{ color: 'var(--smoke-2)' }}>REPS</span>
            </div>

            <div className="space-y-3 mb-5">
              {ex.sets.map((set, si) => (
                <SetRow
                  key={si}
                  set={set}
                  index={si}
                  onChange={(field, value) => updateSet(ei, si, field, value)}
                  onRemove={() => removeSet(ei, si)}
                />
              ))}
            </div>

            {calcExerciseCalories(ex.name, ex.sets) > 0 && (
              <p className="font-data text-xs mb-3" style={{ color: 'var(--smoke)' }}>
                ~{calcExerciseCalories(ex.name, ex.sets)} kcal for this exercise
              </p>
            )}

            <button
              onClick={() => addSet(ei)}
              className="font-data text-xs tracking-widest uppercase transition-colors"
              style={{ color: 'var(--smoke)' } as React.CSSProperties}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--lime)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--smoke)')}
            >
              + ADD SET
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addExercise}
        className="mt-5 w-full rounded-xl py-4 font-data text-sm tracking-widest uppercase transition-colors"
        style={{ border: '1px dashed var(--edge-2)', color: 'var(--smoke)', background: 'transparent' } as React.CSSProperties}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--lime)'; e.currentTarget.style.color = 'var(--lime)' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--edge-2)'; e.currentTarget.style.color = 'var(--smoke)' }}
      >
        + ADD EXERCISE
      </button>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Session notes (optional)"
        rows={2}
        className="mt-5 w-full rounded-xl px-5 py-4 text-sm resize-none"
        style={{ background: 'var(--card)', border: '1px solid var(--edge)', color: 'var(--iron)' }}
      />

      {error && <p className="font-data text-xs mt-3" style={{ color: 'var(--danger)' }}>{error}</p>}

      <button
        onClick={save}
        disabled={saving}
        className="mt-6 w-full btn-lime py-4 rounded-xl text-lg"
      >
        {saving ? 'SAVING...' : 'SAVE SESSION'}
      </button>
    </div>
  )
}

export default function NewWorkout() {
  return <AuthGuard><NewWorkoutForm /></AuthGuard>
}
