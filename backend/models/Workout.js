const { Schema, model, Types } = require('mongoose')

const SetSchema = new Schema(
  {
    reps: { type: Number, required: true, min: 1 },
    weight: { type: Number, required: true, min: 0 },
  },
  { _id: false }
)

const ExerciseSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    sets: { type: [SetSchema], required: true },
  },
  { _id: false }
)

const WorkoutSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, default: Date.now, index: true },
    exercises: { type: [ExerciseSchema], required: true },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
)

// Для /api/progress: макс вес по упражнению за дату
WorkoutSchema.statics.getProgress = function (userId, exerciseName) {
  return this.aggregate([
    { $match: { user: userId } },
    { $unwind: '$exercises' },
    { $match: { 'exercises.name': exerciseName } },
    { $unwind: '$exercises.sets' },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        maxWeight: { $max: '$exercises.sets.weight' },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { date: '$_id', maxWeight: 1, _id: 0 } },
  ])
}

module.exports = model('Workout', WorkoutSchema)
