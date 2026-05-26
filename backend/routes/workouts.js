const router = require('express').Router()
const { Types } = require('mongoose')
const Workout = require('../models/Workout')
const requireAuth = require('../middleware/auth')

router.use(requireAuth)

// GET /api/workouts/exercises — уникальные упражнения пользователя
router.get('/exercises', async (req, res) => {
  try {
    const results = await Workout.aggregate([
      { $match: { user: new Types.ObjectId(req.user.id) } },
      { $unwind: '$exercises' },
      { $group: { _id: '$exercises.name' } },
      { $sort: { _id: 1 } },
      { $project: { name: '$_id', _id: 0 } },
    ])
    res.json(results.map((r) => r.name))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/workouts/progress?exercise=Bench+press  — должен быть ПЕРЕД /:id
router.get('/progress', async (req, res) => {
  try {
    const { exercise } = req.query
    if (!exercise) return res.status(400).json({ error: 'exercise query param required' })
    const data = await Workout.getProgress(new Types.ObjectId(req.user.id), exercise)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/workouts
router.post('/', async (req, res) => {
  try {
    const workout = await Workout.create({ ...req.body, user: req.user.id })
    res.status(201).json(workout)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// GET /api/workouts?page=1&limit=10
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(50, parseInt(req.query.limit) || 10)
    const skip = (page - 1) * limit

    const [workouts, total] = await Promise.all([
      Workout.find({ user: req.user.id }).sort({ date: -1 }).skip(skip).limit(limit).lean(),
      Workout.countDocuments({ user: req.user.id }),
    ])

    res.json({ workouts, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/workouts/:id
router.get('/:id', async (req, res) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, user: req.user.id }).lean()
    if (!workout) return res.status(404).json({ error: 'Not found' })
    res.json(workout)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/workouts/:id
router.delete('/:id', async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({ _id: req.params.id, user: req.user.id })
    if (!workout) return res.status(404).json({ error: 'Not found' })
    res.json({ deleted: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
