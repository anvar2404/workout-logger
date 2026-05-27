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

interface PrevSet { weight: number; reps: number; rpe?: number }

function ExerciseSearch({ value, onChange }: { value: string; onChange: (n: string) => void }) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const filtered = query.trim() ? EXERCISES.filter((e) => e.toLowerCase().includes(query.toLowerCase())) : EXERCISES

  useEffect(() => { setQuery(value) }, [value])
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} style={{ flex: 1, position: 'relative' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder="Exercise name"
        style={{ width: '100%', fontFamily: 'var(--font-dm)', fontWeight: 700, fontSize: 16, background: 'transparent', border: 'none', borderBottom: '2px solid var(--border)', borderRadius: 0, color: 'var(--text)', padding: '4px 0', outline: 'none', boxShadow: 'none' }}
      />
      {open && filtered.length > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: '100%', marginTop: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, maxHeight: 220, overflowY: 'auto', zIndex: 60, boxShadow: 'var(--shadow-md)' }}>
          {filtered.map((name) => (
            <button
              key={name}
              onMouseDown={() => { onChange(name); setQuery(name); setOpen(false) }}
              style={{ width: '100%', textAlign: 'left', padding: '10px 14px', fontFamily: 'var(--font-dm)', fontSize: 14, fontWeight: name === value ? 600 : 400, color: name === value ? 'var(--accent)' : 'var(--text)', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: getMuscleColor(name), flexShrink: 0 }} />
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface SetRowProps {
  set: Set; index: number; prevSet?: PrevSet
  onChange: (f: keyof Set, v: number) => void
  onRemove: () => void; onDone: () => void
  isDone: boolean; isNewPR: boolean
}

function SetRow({ set, index, prevSet, onChange, onRemove, onDone, isDone, isNewPR }: SetRowProps) {
  const rm = set.weight > 0 && set.reps > 0 ? estimate1RM(set.weight, set.reps) : 0

  return (
    <div
      className={isDone ? 'set-done' : ''}
      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 9, border: '1px solid transparent', transition: 'all 0.2s' }}
    >
      {/* # */}
      <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 12, color: 'var(--text-3)', width: 16, textAlign: 'center', flexShrink: 0 }}>{index + 1}</span>

      {/* Previous */}
      <div style={{ flex: 1, minWidth: 60 }}>
        {prevSet ? (
          <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, color: 'var(--text-3)' }}>
            {prevSet.weight}×{prevSet.reps}
          </span>
        ) : (
          <span style={{ fontFamily: 'var(--font-dm)', fontSize: 11, color: 'var(--text-3)' }}>—</span>
        )}
      </div>

      {/* Weight */}
      <input
        type="number"
        value={set.weight || ''}
        onChange={(e) => onChange('weight', parseFloat(e.target.value) || 0)}
        placeholder={prevSet ? String(prevSet.weight) : '0'}
        style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 15, fontWeight: 700, background: isDone ? 'transparent' : 'var(--bg)', border: `1px solid ${isDone ? 'transparent' : 'var(--border)'}`, borderRadius: 8, color: isDone ? 'var(--text-2)' : 'var(--text)', padding: '6px 8px', width: 60, textAlign: 'center', transition: 'all 0.2s' }}
      />

      {/* Reps */}
      <input
        type="number"
        value={set.reps || ''}
        onChange={(e) => onChange('reps', parseInt(e.target.value) || 0)}
        placeholder={prevSet ? String(prevSet.reps) : '0'}
        style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 15, fontWeight: 700, background: isDone ? 'transparent' : 'var(--bg)', border: `1px solid ${isDone ? 'transparent' : 'var(--border)'}`, borderRadius: 8, color: isDone ? 'var(--text-2)' : 'var(--text)', padding: '6px 8px', width: 52, textAlign: 'center', transition: 'all 0.2s' }}
      />

      {/* RPE */}
      <select
        value={set.rpe ?? ''}
        onChange={(e) => onChange('rpe', parseFloat(e.target.value) || 0)}
        style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, background: isDone ? 'transparent' : 'var(--bg)', border: `1px solid ${isDone ? 'transparent' : 'var(--border)'}`, borderRadius: 8, color: set.rpe ? 'var(--amber)' : 'var(--text-3)', padding: '6px 4px 6px 6px', width: 52, appearance: 'none', WebkitAppearance: 'none' }}
      >
        <option value="">RPE</option>
        {RPE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>

      {/* 1RM + PR */}
      {rm > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 52 }}>
          <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, color: 'var(--text-3)' }}>~{rm}</span>
          {isNewPR && <span className="pr-badge">PR</span>}
        </div>
      )}
      {rm === 0 && <div style={{ minWidth: 52 }} />}

      {/* Done checkbox */}
      <button
        onClick={onDone}
        style={{ width: 28, height: 28, borderRadius: 8, border: isDone ? 'none' : '1.5px solid var(--border)', background: isDone ? 'var(--success)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}
      >
        {isDone && (
          <svg className="check-pop" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 7L5.5 10L11.5 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Remove */}
      <button onClick={onRemove} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 18, lineHeight: 1, padding: '0 2px', flexShrink: 0, transition: 'color 0.15s' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-3)')}>×</button>
    </div>
  )
}

interface ExCardProps {
  ex: Exercise; index: number; prevSets: PrevSet[]; doneSets: boolean[]
  onNameChange: (n: string) => void
  onSetChange: (si: number, f: keyof Set, v: number) => void
  onAddSet: () => void; onRemoveSet: (si: number) => void
  onRemoveExercise: () => void; onToggleDone: (si: number) => void
  onRestTimer: () => void; canRemove: boolean
}

function ExerciseCard({ ex, index, prevSets, doneSets, onNameChange, onSetChange, onAddSet, onRemoveSet, onRemoveExercise, onToggleDone, onRestTimer, canRemove }: ExCardProps) {
  const muscle = getMuscleGroup(ex.name)
  const muscleColor = getMuscleColor(ex.name)
  const prevMax = prevSets.reduce((m, s) => Math.max(m, estimate1RM(s?.weight ?? 0, s?.reps ?? 0)), 0)

  const suggestion = prevSets[0]
    ? suggestWeight(prevSets[0].weight, prevSets[0].reps, prevSets[0].rpe ?? 8, ex.sets[0]?.reps || 8)
    : null

  return (
    <div className="card" style={{ marginBottom: 12, overflow: 'hidden' }}>
      {/* Exercise header */}
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <ExerciseSearch value={ex.name} onChange={onNameChange} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: muscleColor, flexShrink: 0, display: 'inline-block' }} />
              <span style={{ fontFamily: 'var(--font-dm)', fontSize: 11, color: 'var(--text-2)', fontWeight: 500 }}>{muscle}</span>
              {suggestion && (
                <span style={{ fontFamily: 'var(--font-dm)', fontSize: 11, color: 'var(--text-3)', marginLeft: 4 }}>
                  · suggest {suggestion.weight}kg
                </span>
              )}
            </div>
          </div>
          {canRemove && (
            <button onClick={onRemoveExercise} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4, marginTop: 2, transition: 'color 0.15s', flexShrink: 0 }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-3)')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 10px 4px', backgroundColor: 'var(--bg)' }}>
        <span style={{ fontFamily: 'var(--font-dm)', fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', width: 16, textAlign: 'center', flexShrink: 0 }}>#</span>
        <span style={{ fontFamily: 'var(--font-dm)', fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', flex: 1 }}>Previous</span>
        <span style={{ fontFamily: 'var(--font-dm)', fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', width: 60, textAlign: 'center' }}>kg</span>
        <span style={{ fontFamily: 'var(--font-dm)', fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', width: 52, textAlign: 'center' }}>Rep</span>
        <span style={{ fontFamily: 'var(--font-dm)', fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', width: 52, textAlign: 'center' }}>RPE</span>
        <span style={{ fontFamily: 'var(--font-dm)', fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', width: 52 }}>1RM</span>
        <span style={{ width: 28, flexShrink: 0 }} />
        <span style={{ width: 22, flexShrink: 0 }} />
      </div>

      {/* Sets */}
      <div style={{ padding: '4px 0 8px' }}>
        {ex.sets.map((set, si) => {
          const thisRM = estimate1RM(set.weight, set.reps)
          return (
            <SetRow
              key={si}
              set={set} index={si}
              prevSet={prevSets[si]}
              onChange={(f, v) => onSetChange(si, f, v)}
              onRemove={() => onRemoveSet(si)}
              onDone={() => { onToggleDone(si); if (!doneSets[si]) onRestTimer() }}
              isDone={doneSets[si]}
              isNewPR={thisRM > prevMax && thisRM > 0}
            />
          )
        })}
      </div>

      {/* Add set */}
      <div style={{ padding: '8px 16px 14px', borderTop: '1px solid var(--border)' }}>
        <button onClick={onAddSet} style={{ fontFamily: 'var(--font-dm)', fontSize: 13, fontWeight: 500, color: 'var(--accent)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          Add a Set
        </button>
      </div>
    </div>
  )
}

function NewWorkoutForm() {
  const router = useRouter()
  const [exercises, setExercises] = useState<Exercise[]>([{ name: 'Bench Press', sets: [{ reps: 0, weight: 0 }] }])
  const [doneSets, setDoneSets] = useState<boolean[][]>([[false]])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [restActive, setRestActive] = useState(false)
  const [prevWorkouts, setPrevWorkouts] = useState<Workout[]>([])

  useEffect(() => { const id = setInterval(() => setElapsed((s) => s + 1), 1000); return () => clearInterval(id) }, [])
  useEffect(() => { api.get('/workouts?limit=10').then((r) => setPrevWorkouts(r.data.workouts ?? [])).catch(() => {}) }, [])

  const getPrevSets = useCallback((name: string): PrevSet[] => {
    for (const w of prevWorkouts) {
      const ex = w.exercises.find((e) => e.name === name)
      if (ex) return ex.sets
    }
    return []
  }, [prevWorkouts])

  const addExercise = () => { setExercises((p) => [...p, { name: EXERCISES[0], sets: [{ reps: 0, weight: 0 }] }]); setDoneSets((p) => [...p, [false]]) }
  const removeExercise = (ei: number) => { setExercises((p) => p.filter((_, i) => i !== ei)); setDoneSets((p) => p.filter((_, i) => i !== ei)) }
  const updateExerciseName = (ei: number, name: string) => setExercises((p) => p.map((ex, i) => i === ei ? { ...ex, name } : ex))
  const addSet = (ei: number) => { setExercises((p) => p.map((ex, i) => i === ei ? { ...ex, sets: [...ex.sets, { reps: 0, weight: 0 }] } : ex)); setDoneSets((p) => p.map((r, i) => i === ei ? [...r, false] : r)) }
  const updateSet = (ei: number, si: number, field: keyof Set, value: number) => setExercises((p) => p.map((ex, i) => i === ei ? { ...ex, sets: ex.sets.map((s, j) => j === si ? { ...s, [field]: value } : s) } : ex))
  const removeSet = (ei: number, si: number) => { setExercises((p) => p.map((ex, i) => i === ei ? { ...ex, sets: ex.sets.filter((_, j) => j !== si) } : ex)); setDoneSets((p) => p.map((r, i) => i === ei ? r.filter((_, j) => j !== si) : r)) }
  const toggleDone = (ei: number, si: number) => setDoneSets((p) => p.map((r, i) => i === ei ? r.map((d, j) => j === si ? !d : d) : r))

  const save = async () => {
    setError('')
    const valid = exercises.every((ex) => ex.name && ex.sets.length > 0 && ex.sets.every((s) => s.reps > 0 && s.weight >= 0))
    if (!valid) { setError('Fill in all sets before saving'); return }
    try { setSaving(true); await api.post('/workouts', { exercises, notes }); router.push('/') }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Save failed') }
    finally { setSaving(false) }
  }

  const totalDone = doneSets.flat().filter(Boolean).length
  const totalAll = doneSets.flat().length

  return (
    <div>
      {restActive && <RestTimer seconds={90} onDone={() => setRestActive(false)} onSkip={() => setRestActive(false)} />}

      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(242,244,241,0.96)', backdropFilter: 'blur(10px)', paddingBottom: 14, marginBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-dm)', fontSize: 11, color: 'var(--text-3)', marginBottom: 1 }}>Active Session</p>
            <p style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, fontSize: 24, color: 'var(--accent)', lineHeight: 1 }}>{formatElapsed(elapsed)}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-jetbrains)', fontWeight: 700, fontSize: 18, color: 'var(--text)', lineHeight: 1 }}>
                {totalDone}<span style={{ color: 'var(--text-3)', fontSize: 13 }}>/{totalAll}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-dm)', fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>sets</div>
            </div>
            <button onClick={save} disabled={saving} className="btn-accent" style={{ padding: '10px 22px', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              {saving ? '...' : 'Finish'}
            </button>
          </div>
        </div>
        {totalAll > 0 && (
          <div style={{ height: 3, background: 'var(--border)', borderRadius: 2 }}>
            <div style={{ height: '100%', background: 'var(--accent)', borderRadius: 2, width: `${(totalDone / totalAll) * 100}%`, transition: 'width 0.3s ease' }} />
          </div>
        )}
      </div>

      {/* Exercise cards */}
      {exercises.map((ex, ei) => (
        <ExerciseCard
          key={ei} ex={ex} index={ei}
          prevSets={getPrevSets(ex.name)} doneSets={doneSets[ei] ?? []}
          onNameChange={(name) => updateExerciseName(ei, name)}
          onSetChange={(si, f, v) => updateSet(ei, si, f, v)}
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
        style={{ width: '100%', padding: '13px', fontFamily: 'var(--font-dm)', fontSize: 14, fontWeight: 500, color: 'var(--accent)', background: 'var(--accent-light)', border: '1.5px dashed rgba(37,99,235,0.3)', borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-dim)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent-light)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        Add Exercise
      </button>

      {/* Notes */}
      <textarea
        value={notes} onChange={(e) => setNotes(e.target.value)}
        placeholder="Session notes (optional)" rows={2}
        style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)', padding: '12px 14px', fontFamily: 'var(--font-dm)', fontSize: 14, resize: 'none', outline: 'none', marginBottom: 8 }}
      />

      {error && <p style={{ fontFamily: 'var(--font-dm)', fontSize: 13, color: 'var(--danger)', marginBottom: 10 }}>{error}</p>}
    </div>
  )
}

export default function NewWorkout() {
  return <AuthGuard><NewWorkoutForm /></AuthGuard>
}
