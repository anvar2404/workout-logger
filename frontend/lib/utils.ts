export const MUSCLE_GROUPS: Record<string, string> = {
  'Bench Press': 'Chest', 'Incline Bench Press': 'Chest', 'Decline Bench Press': 'Chest',
  'Dumbbell Fly': 'Chest', 'Cable Crossover': 'Chest', 'Push-up': 'Chest',
  'Close-Grip Bench Press': 'Chest', 'Dips': 'Chest', 'Diamond Push-up': 'Triceps',
  'Deadlift': 'Back', 'Barbell Row': 'Back', 'Dumbbell Row': 'Back',
  'Lat Pulldown': 'Back', 'Seated Cable Row': 'Back', 'T-Bar Row': 'Back',
  'Face Pull': 'Back', 'Sumo Deadlift': 'Back',
  'Pull-up': 'Back', 'Chin-up': 'Back',
  'Overhead Press': 'Shoulders', 'Dumbbell Shoulder Press': 'Shoulders',
  'Lateral Raise': 'Shoulders', 'Front Raise': 'Shoulders',
  'Rear Delt Fly': 'Shoulders', 'Arnold Press': 'Shoulders', 'Shrug': 'Traps',
  'Squat': 'Quads', 'Front Squat': 'Quads', 'Leg Press': 'Quads',
  'Leg Extension': 'Quads', 'Bulgarian Split Squat': 'Quads',
  'Romanian Deadlift': 'Hamstrings', 'Leg Curl': 'Hamstrings',
  'Hip Thrust': 'Glutes', 'Calf Raise': 'Calves',
  'Barbell Curl': 'Biceps', 'Dumbbell Curl': 'Biceps', 'Hammer Curl': 'Biceps',
  'Preacher Curl': 'Biceps', 'Cable Curl': 'Biceps', 'Concentration Curl': 'Biceps',
  'Tricep Pushdown': 'Triceps', 'Skull Crusher': 'Triceps',
  'Overhead Tricep Extension': 'Triceps', 'Tricep Kickback': 'Triceps',
  'Plank': 'Core', 'Ab Wheel': 'Core', 'Hanging Leg Raise': 'Core',
  'Russian Twist': 'Core', 'Cable Crunch': 'Core', 'Farmer Walk': 'Full Body',
}

export const MUSCLE_COLORS: Record<string, string> = {
  Chest: '#FF6B6B', Back: '#4ECDC4', Shoulders: '#45B7D1', Quads: '#96CEB4',
  Hamstrings: '#88D8A3', Glutes: '#DDA0DD', Calves: '#98D8C8',
  Biceps: '#FFB347', Triceps: '#FF9F43', Core: '#A8E6CF',
  Traps: '#74B9FF', 'Full Body': '#C9FF47',
}

export const getMuscleGroup = (exercise: string): string =>
  MUSCLE_GROUPS[exercise] ?? 'Other'

export const getMuscleColor = (exercise: string): string =>
  MUSCLE_COLORS[getMuscleGroup(exercise)] ?? '#566356'

// Epley formula
export const estimate1RM = (weight: number, reps: number): number => {
  if (reps === 0 || weight === 0) return 0
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}

// Suggest next weight based on last performance
export const suggestWeight = (
  lastWeight: number,
  lastReps: number,
  lastRpe: number,
  targetReps: number
): { weight: number; reason: string } => {
  if (lastRpe <= 6 && lastReps >= targetReps)
    return { weight: lastWeight + 5, reason: `RPE ${lastRpe} — push harder` }
  if (lastRpe <= 7 && lastReps >= targetReps)
    return { weight: lastWeight + 2.5, reason: `RPE ${lastRpe} — add 2.5 kg` }
  if (lastRpe >= 9 || lastReps < targetReps - 1)
    return { weight: Math.max(lastWeight - 2.5, 0), reason: 'Too heavy — deload' }
  return { weight: lastWeight, reason: 'Keep the same weight' }
}

export const formatElapsed = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export const calculateStreak = (workouts: { date: string }[]): number => {
  if (!workouts.length) return 0
  const dates = [...new Set(workouts.map((w) => w.date.split('T')[0]))]
    .sort()
    .reverse()
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  if (dates[0] !== today && dates[0] !== yesterday) return 0
  let streak = 0
  for (let i = 0; i < dates.length - 1; i++) {
    streak++
    const curr = new Date(dates[i]).getTime()
    const next = new Date(dates[i + 1]).getTime()
    if ((curr - next) / 86400000 > 1.5) break
  }
  return streak + 1
}
