// Коэффициенты на основе MET-значений из Compendium of Physical Activities (Ainsworth et al.)
// Формула: ккал = reps × weight_kg × coeff
// Для упражнений с собственным весом (weight=0) используется 75 кг по умолчанию

const COEFFICIENTS: Record<string, number> = {
  // Ноги — тяжёлые составные
  'Squat':                   0.132,
  'Front Squat':             0.130,
  'Sumo Deadlift':           0.128,
  'Deadlift':                0.128,
  'Romanian Deadlift':       0.115,
  'Bulgarian Split Squat':   0.118,
  'Leg Press':               0.105,
  'Hip Thrust':              0.100,
  'Leg Curl':                0.080,
  'Leg Extension':           0.075,
  'Calf Raise':              0.060,

  // Грудь
  'Bench Press':             0.100,
  'Incline Bench Press':     0.098,
  'Decline Bench Press':     0.098,
  'Dumbbell Fly':            0.070,
  'Cable Crossover':         0.068,
  'Close-Grip Bench Press':  0.085,

  // Спина
  'Barbell Row':             0.105,
  'T-Bar Row':               0.100,
  'Dumbbell Row':            0.090,
  'Lat Pulldown':            0.088,
  'Seated Cable Row':        0.085,
  'Face Pull':               0.070,
  'Shrug':                   0.065,

  // Плечи
  'Overhead Press':          0.095,
  'Dumbbell Shoulder Press': 0.090,
  'Arnold Press':            0.088,
  'Lateral Raise':           0.060,
  'Front Raise':             0.058,
  'Rear Delt Fly':           0.058,

  // Собственный вес
  'Pull-up':                 0.110,
  'Chin-up':                 0.108,
  'Push-up':                 0.105,
  'Dips':                    0.115,
  'Diamond Push-up':         0.095,
  'Hanging Leg Raise':       0.085,

  // Бицепс
  'Barbell Curl':            0.072,
  'Dumbbell Curl':           0.068,
  'Hammer Curl':             0.068,
  'Preacher Curl':           0.065,
  'Cable Curl':              0.065,
  'Concentration Curl':      0.062,

  // Трицепс
  'Tricep Pushdown':         0.068,
  'Skull Crusher':           0.070,
  'Overhead Tricep Extension': 0.068,
  'Tricep Kickback':         0.060,

  // Кор и прочее
  'Ab Wheel':                0.090,
  'Cable Crunch':            0.070,
  'Russian Twist':           0.075,
  'Plank':                   0.080,
  'Farmer Walk':             0.110,
}

const BODYWEIGHT_EXERCISES = new Set([
  'Pull-up', 'Chin-up', 'Push-up', 'Dips', 'Diamond Push-up', 'Hanging Leg Raise',
])

const DEFAULT_COEFF = 0.080
const DEFAULT_BODYWEIGHT = 75

export function calcExerciseCalories(
  name: string,
  sets: { reps: number; weight: number }[]
): number {
  const coeff = COEFFICIENTS[name] ?? DEFAULT_COEFF
  const total = sets.reduce((sum, s) => {
    const w = BODYWEIGHT_EXERCISES.has(name) && s.weight === 0
      ? DEFAULT_BODYWEIGHT
      : Math.max(s.weight, 1)
    return sum + s.reps * w * coeff
  }, 0)
  return Math.round(total)
}

export function calcTotalCalories(
  exercises: { name: string; sets: { reps: number; weight: number }[] }[]
): number {
  return exercises.reduce((sum, ex) => sum + calcExerciseCalories(ex.name, ex.sets), 0)
}
