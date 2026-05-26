'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Exercise, Set, Workout } from '@/lib/types'
import AuthGuard from '@/components/AuthGuard'
import RestTimer from '@/components/RestTimer'
import { estimate1RM, getMuscleGroup, getMuscleColor, suggestWeight, formatElapsed } from '@/lib/utils'

const EXERCISES = [
  'Bench Press', 'Incline Bench Press', 'Decline Bench Press', 'Dumbbell Fly', 'Cable Crossover', 'Push-up', 'Dips',
  'Deadlift', 'Pull-up', 'Chin-up', 'Barbell Row', 'Dumbbell Row', 'Lat Pulldown', 'Seated Cable Row', 'T-Bar Row', 'Face Pull', 'Sumo Deadlift',
  'Overhead Press', 'Dumbbell Shoulder Press', 'Lateral Raise', 'Front Raise', 'Rear Delt Fly', 'Arnold Press', 'Shrug',
  'Squat', 'Front Squat', 'Leg Press', 'Romanian Deadlift', 'Leg Curl', 'Leg Extension', 'Calf Raise', 'Bulgarian Split Squat', 'Hip Thrust',
  'Barbell Curl', 'Dumbbell Curl', 'Hammer Curl', 'Preacher Curl', 'Cable Curl', 'Concentration Curl',
  'Tricep Pushdown', 'Skull Crusher', 'Overhead Tricep Extension', 'Close-Grip Bench Press', 'Tricep Kickback', 'Diamond Push-up',
  'Plank', 'Ab Wheel', 'Hanging Leg Raise', 'Russian Twist', 'Cable Crunch', 'Farmer Walk',
]

const RPE_OPTIONS = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10]

interface PrevSet {
  weight: number
  reps: number
  rpe?: number
}

function ExerciseSearch({ value, onChange }: { value: string; onChange: (n: string) => void }) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const filtered = query.trim() ? EXERCISES.filter((e) => e.toLowerCase().includes(query.toLowerCase())) : EXERCISES

  useEffect(() => { setQuery(value) }, [value])
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (name: string) => { onChange(name); setQuery(name); setOpen(false) }

  return (
    <div ref={ref} style={{ flex: 1, position: 'relative' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder="Exercise..."
        style={{
          width: '100%',
          fontFamily: 'var(--font-bebas)',
          fontSize: 22,
          letterSpacing: '0.03em',
          background: 'transparent',
          border: 'none',
          borderBottom: '1px solid var(--edge-2)',
          borderRadius: 0,
          color: 'var(--iron)',
          padding: '4px 0',
          outline: 'none',
        }}
      />
      {open && filtered.length > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '100%',
            marginTop: 4,
            background: 'var(--card-2)',
            border: '1px solid var(--edge-2)',
            borderRadius: 12,
            maxHeight: 240,
            overflowY: 'auto',
            zIndex: 60,
          }}
        >
          {filtered.map((name) => (
            <button
              key={name}
              onMouseDown={() => select(name)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 14px',
                fontFamily: 'var(--font-bebas)',
                fontSize: 18,
                letterSpacing: '0.03em',
                color: name === value ? 'var(--lime)' : 'var(--iron)',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--edge)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: getMuscleColor(name), flexShrink: 0 }} />
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface SetRowProps {
  set: Set
  index: number
  prevSet?: PrevSet
  onChange: (field: keyof Set, value: number) => void
  onRemove: () => void
  onDone: () => void
  isDone: boolean
  isNewPR: boolean
}

function SetRow({ set, index, prevSet, onChange, onRemove, onDone, isDone, isNewPR }: SetRowProps) {
  const rm = set.weight > 0 && set.reps > 0 ? estimate1RM(set.weight, set.reps) : 0

  return (
    <div>
      {/* Prev performance hint */}
      {prevSet && (
        <div style={{ paddingLeft: 28, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 9, color: 'var(--smoke-2)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            prev:
          </span>
          <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, color: 'var(--smoke)' }}>
            {prevSet.weight}kg × {prevSet.reps}
            {prevSet.rpe ? <span style={{ color: 'var(--smoke-2)' }}> @{prevSet.rpe}</span> : null}
          </span>
        </div>
      )}

      <div
        className={isDone ? 'set-done' : ''}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 10px',
          borderRadius: 10,
          border: '1px solid transparent',
          transition: 'all 0.2s',
          background: isDone ? 'rgba(201,255,71,0.04)' : 'transparent',
        }}
      >
        {/* Set number */}
        <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 12, color: 'var(--smoke-2)', width: 18, flexShrink: 0, textAlign: 'center' }}>
          {index + 1}
        </span>

        {/* Weight */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1 }}>
          <input
            type="number"
            value={set.weight || ''}
            onChange={(e) => onChange('weight', parseFloat(e.target.value) || 0)}
            placeholder={prevSet ? String(prevSet.weight) : '0'}
            style={{
              fontFamily: 'var(--font-jetbrains)',
              fontSize: 18,
              fontWeight: 700,
              background: 'var(--card-2)',
              border: '1px solid var(--edge)',
              borderRadius: 8,
              color: isDone ? 'var(--smoke)' : 'var(--iron)',
              padding: '7px 10px',
              width: 72,
              textAlign: 'center',
            }}
          />
          <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, color: 'var(--smoke)', flexShrink: 0 }}>kg</span>
        </div>

        <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 14, color: 'var(--smoke-2)', flexShrink: 0 }}>×</span>

        {/* Reps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1 }}>
          <input
            type="number"
            value={set.reps || ''}
            onChange={(e) => onChange('reps', parseInt(e.target.value) || 0)}
            placeholder={prevSet ? String(prevSet.reps) : '0'}
            style={{
              fontFamily: 'var(--font-jetbrains)',
              fontSize: 18,
              fontWeight: 700,
              background: 'var(--card-2)',
              border: '1px solid var(--edge)',
              borderRadius: 8,
              color: isDone ? 'var(--smoke)' : 'var(--iron)',
              padding: '7px 10px',
              width: 60,
              textAlign: 'center',
            }}
          />
          <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, color: 'var(--smoke)', flexShrink: 0 }}>rep</span>
        </div>

        {/* RPE selector */}
        <select
          value={set.rpe ?? ''}
          onChange={(e) => onChange('rpe', parseFloat(e.target.value) || 0)}
          style={{
            fontFamily: 'var(--font-jetbrains)',
            fontSize: 11,
            background: 'var(--card-2)',
            border: '1px solid var(--edge)',
            borderRadius: 8,
            color: set.rpe ? 'var(--amber)' : 'var(--smoke-2)',
            padding: '7px 6px 7px 8px',
            width: 52,
            appearance: 'none',
            WebkitAppearance: 'none',
          }}
        >
          <option value="">RPE</option>
          {RPE_OPTIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        {/* Done checkbox */}
        <button
          onClick={() => { onDone() }}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: isDone ? 'none' : '1px solid var(--edge-2)',
            background: isDone ? 'var(--lime)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s',
          }}
        >
          {isDone && (
            <svg className="check-pop" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8L6.5 11.5L13 5" stroke="var(--void)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Remove */}
        <button
          onClick={onRemove}
          style={{
            fontFamily: 'var(--font-jetbrains)',
            fontSize: 16,
            color: 'var(--smoke-2)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0 2px',
            flexShrink: 0,
            lineHeight: 1,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--smoke-2)')}
        >
          ×
        </button>
      </div>

      {/* 1RM estimate + PR */}
      {rm > 0 && (
        <div style={{ paddingLeft: 28, marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 9, color: 'var(--smoke-2)', letterSpacing: '0.06em' }}>
            ~1RM {rm}kg
          </span>
          {isNewPR && <span className="pr-badge">PR</span>}
        </div>
      )}
    </div>
  )
}

interface ExerciseCardProps {
  ex: Exercise
  index: number
  prevSets: PrevSet[]
  doneSets: boolean[]
  onNameChange: (name: string) => void
  onSetChange: (si: number, field: keyof Set, value: number) => void
  onAddSet: () => void
  onRemoveSet: (si: number) => void
  onRemoveExercise: () => void
  onToggleDone: (si: number) => void
  onRestTimer: () => void
  canRemove: boolean
}

function ExerciseCard({
  ex, index, prevSets, doneSets,
  onNameChange, onSetChange, onAddSet, onRemoveSet,
  onRemoveExercise, onToggleDone, onRestTimer, canRemove,
}: ExerciseCardProps) {
  const muscle = getMuscleGroup(ex.name)
  const muscleColor = getMuscleColor(ex.name)

  const topSet = ex.sets.reduce(
    (best, s) => (s.weight > best.weight ? s : best),
    ex.sets[0] ?? { weight: 0, reps: 0 }
  )
  const prevTopSet = prevSets.reduce(
    (best, s) => (s?.weight > best?.weight ? s : best),
    prevSets[0]
  )
  const currentMax1RM = estimate1RM(topSet.weight, topSet.reps)
  const prevMax1RM = prevTopSet ? estimate1RM(prevTopSet.weight, prevTopSet.reps) : 0
  const hasSessionPR = currentMax1RM > prevMax1RM && currentMax1RM > 0

  const suggestion = prevTopSet
    ? suggestWeight(prevTopSet.weight, prevTopSet.reps, prevTopSet.rpe ?? 8, ex.sets[0]?.reps || 8)
    : null

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--edge)',
        borderLeft: `3px solid ${muscleColor}`,
        borderRadius: 14,
        padding: '16px 14px',
        marginBottom: 12,
      }}
    >
      {/* Exercise header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 4 }}>
        <span style={{ fontFamily: 'var(--font-bebas)', fontSize: 20, color: 'var(--smoke)', lineHeight: 1.4, flexShrink: 0 }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <ExerciseSearch value={ex.name} onChange={onNameChange} />
        </div>
        {canRemove && (
          <button
            onClick={onRemoveExercise}
            style={{
              fontFamily: 'var(--font-jetbrains)',
              fontSize: 9,
              letterSpacing: '0.08em',
              color: 'var(--smoke-2)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              paddingTop: 6,
              textTransform: 'uppercase',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--smoke-2)')}
          >
            REMOVE
          </button>
        )}
      </div>

      {/* Muscle tag + session PR */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingLeft: 30 }}>
        <span
          style={{
            fontFamily: 'var(--font-jetbrains)',
            fontSize: 9,
            letterSpacing: '0.08em',
            padding: '2px 7px',
            borderRadius: 4,
            background: `${muscleColor}18`,
            border: `1px solid ${muscleColor}40`,
            color: muscleColor,
            textTransform: 'uppercase',
          }}
        >
          {muscle}
        </span>
        {hasSessionPR && <span className="pr-badge">SESSION PR</span>}
        {suggestion && (
          <span style={{
            fontFamily: 'var(--font-jetbrains)',
            fontSize: 9,
            color: 'var(--smoke)',
            letterSpacing: '0.04em',
          }}>
            → {suggestion.weight}kg ({suggestion.reason})
          </span>
        )}
      </div>

      {/* Column labels */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 26, marginBottom: 6 }}>
        <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 8, color: 'var(--smoke-2)', letterSpacing: '0.08em', width: 18, textAlign: 'center', flexShrink: 0 }}>#</span>
        <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 8, color: 'var(--smoke-2)', letterSpacing: '0.08em', flex: 1, textAlign: 'center' }}>KG</span>
        <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 8, color: 'var(--smoke-2)', letterSpacing: '0.08em', flex: 1, textAlign: 'center', marginLeft: 16 }}>REPS</span>
        <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 8, color: 'var(--smoke-2)', letterSpacing: '0.08em', width: 52, textAlign: 'center', flexShrink: 0 }}>RPE</span>
        <span style={{ width: 32, flexShrink: 0 }} />
        <span style={{ width: 22, flexShrink: 0 }} />
      </div>

      {/* Sets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {ex.sets.map((set, si) => {
          const prevSet = prevSets[si]
          const prevMax = prevSets.reduce((m, s) => Math.max(m, estimate1RM(s?.weight ?? 0, s?.reps ?? 0)), 0)
          const thisRM = estimate1RM(set.weight, set.reps)
          const isNewPR = thisRM > prevMax && thisRM > 0
          return (
            <SetRow
              key={si}
              set={set}
              index={si}
              prevSet={prevSet}
              onChange={(field, value) => onSetChange(si, field, value)}
              onRemove={() => onRemoveSet(si)}
              onDone={() => { onToggleDone(si); if (!doneSets[si]) onRestTimer() }}
              isDone={doneSets[si]}
              isNewPR={isNewPR}
            />
          )
        })}
      </div>

      <button
        onClick={onAddSet}
        style={{
          marginTop: 10,
          fontFamily: 'var(--font-jetbrains)',
          fontSize: 10,
          letterSpacing: '0.1em',
          color: 'var(--smoke)',
          textTransform: 'uppercase',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          paddingLeft: 28,
          transition: 'color 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--lime)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--smoke)')}
      >
        + ADD SET
      </button>
    </div>
  )
}

function NewWorkoutForm() {
  const router = useRouter()
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: 'Bench Press', sets: [{ reps: 0, weight: 0 }] },
  ])
  const [doneSets, setDoneSets] = useState<boolean[][]>([[false]])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [restActive, setRestActive] = useState(false)
  const [restDuration] = useState(90)
  const [prevWorkouts, setPrevWorkouts] = useState<Workout[]>([])

  // Elapsed timer
  useEffect(() => {
    const id = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Fetch recent workouts for previous performance hints
  useEffect(() => {
    api.get('/workouts?limit=10').then((r) => setPrevWorkouts(r.data.workouts ?? [])).catch(() => {})
  }, [])

  const getPrevSets = useCallback((exerciseName: string): PrevSet[] => {
    for (const w of prevWorkouts) {
      const ex = w.exercises.find((e) => e.name === exerciseName)
      if (ex) return ex.sets
    }
    return []
  }, [prevWorkouts])

  const addExercise = () => {
    setExercises((prev) => [...prev, { name: EXERCISES[0], sets: [{ reps: 0, weight: 0 }] }])
    setDoneSets((prev) => [...prev, [false]])
  }

  const removeExercise = (ei: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== ei))
    setDoneSets((prev) => prev.filter((_, i) => i !== ei))
  }

  const updateExerciseName = (ei: number, name: string) =>
    setExercises((prev) => prev.map((ex, i) => (i === ei ? { ...ex, name } : ex)))

  const addSet = (ei: number) => {
    setExercises((prev) => prev.map((ex, i) => i === ei ? { ...ex, sets: [...ex.sets, { reps: 0, weight: 0 }] } : ex))
    setDoneSets((prev) => prev.map((row, i) => i === ei ? [...row, false] : row))
  }

  const updateSet = (ei: number, si: number, field: keyof Set, value: number) =>
    setExercises((prev) =>
      prev.map((ex, i) => i === ei ? { ...ex, sets: ex.sets.map((s, j) => j === si ? { ...s, [field]: value } : s) } : ex)
    )

  const removeSet = (ei: number, si: number) => {
    setExercises((prev) => prev.map((ex, i) => i === ei ? { ...ex, sets: ex.sets.filter((_, j) => j !== si) } : ex))
    setDoneSets((prev) => prev.map((row, i) => i === ei ? row.filter((_, j) => j !== si) : row))
  }

  const toggleDone = (ei: number, si: number) =>
    setDoneSets((prev) => prev.map((row, i) => i === ei ? row.map((d, j) => j === si ? !d : d) : row))

  const save = async () => {
    setError('')
    const valid = exercises.every((ex) => ex.name && ex.sets.length > 0 && ex.sets.every((s) => s.reps > 0 && s.weight >= 0))
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

  const totalDoneSets = doneSets.flat().filter(Boolean).length
  const totalSets = doneSets.flat().length

  return (
    <div style={{ paddingBottom: 20 }}>
      {/* Rest timer overlay */}
      {restActive && (
        <RestTimer
          seconds={restDuration}
          onDone={() => setRestActive(false)}
          onSkip={() => setRestActive(false)}
        />
      )}

      {/* Sticky top bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(8,10,8,0.95)',
          backdropFilter: 'blur(12px)',
          padding: '10px 0 12px',
          marginBottom: 16,
          borderBottom: '1px solid var(--edge)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 9, color: 'var(--smoke)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
              Active Session
            </div>
            <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 28, color: 'var(--lime)', letterSpacing: '0.03em', lineHeight: 1 }}>
              {formatElapsed(elapsed)}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Progress indicator */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 22, color: 'var(--iron)', lineHeight: 1 }}>
                {totalDoneSets}<span style={{ color: 'var(--smoke)', fontSize: 14 }}>/{totalSets}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 8, color: 'var(--smoke-2)', letterSpacing: '0.06em' }}>SETS</div>
            </div>

            <button
              onClick={save}
              disabled={saving}
              className="btn-lime"
              style={{ padding: '10px 18px', borderRadius: 10, fontSize: 16, letterSpacing: '0.05em' }}
            >
              {saving ? '...' : 'FINISH'}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {totalSets > 0 && (
          <div style={{ marginTop: 10, height: 2, background: 'var(--edge)', borderRadius: 1 }}>
            <div style={{ height: '100%', background: 'var(--lime)', borderRadius: 1, width: `${(totalDoneSets / totalSets) * 100}%`, transition: 'width 0.3s ease' }} />
          </div>
        )}
      </div>

      {/* Exercise cards */}
      {exercises.map((ex, ei) => (
        <ExerciseCard
          key={ei}
          ex={ex}
          index={ei}
          prevSets={getPrevSets(ex.name)}
          doneSets={doneSets[ei] ?? []}
          onNameChange={(name) => updateExerciseName(ei, name)}
          onSetChange={(si, field, value) => updateSet(ei, si, field, value)}
          onAddSet={() => addSet(ei)}
          onRemoveSet={(si) => removeSet(ei, si)}
          onRemoveExercise={() => removeExercise(ei)}
          onToggleDone={(si) => toggleDone(ei, si)}
          onRestTimer={() => setRestActive(true)}
          canRemove={exercises.length > 1}
        />
      ))}

      {/* Add exercise */}
      <button
        onClick={addExercise}
        style={{
          width: '100%',
          padding: '14px',
          fontFamily: 'var(--font-jetbrains)',
          fontSize: 11,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--smoke)',
          background: 'transparent',
          border: '1px dashed var(--edge-2)',
          borderRadius: 12,
          cursor: 'pointer',
          transition: 'all 0.15s',
          marginBottom: 12,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--lime)'; e.currentTarget.style.color = 'var(--lime)' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--edge-2)'; e.currentTarget.style.color = 'var(--smoke)' }}
      >
        + ADD EXERCISE
      </button>

      {/* Notes */}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Session notes..."
        rows={2}
        style={{
          width: '100%',
          background: 'var(--card)',
          border: '1px solid var(--edge)',
          borderRadius: 12,
          color: 'var(--iron)',
          padding: '12px 14px',
          fontFamily: 'var(--font-dm)',
          fontSize: 14,
          resize: 'none',
          outline: 'none',
          marginBottom: 8,
        }}
      />

      {error && (
        <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, color: 'var(--danger)', marginBottom: 10 }}>
          {error}
        </p>
      )}
    </div>
  )
}

export default function NewWorkout() {
  return <AuthGuard><NewWorkoutForm /></AuthGuard>
}
