export interface Set {
  reps: number
  weight: number
}

export interface Exercise {
  name: string
  sets: Set[]
}

export interface Workout {
  _id: string
  date: string
  exercises: Exercise[]
  notes: string
  createdAt: string
}

export interface ProgressPoint {
  date: string
  maxWeight: number
}
