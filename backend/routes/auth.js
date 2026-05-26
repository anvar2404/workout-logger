const router = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body
    const user = await User.create({ email, password, name })
    res.status(201).json({ token: sign(user._id), user })
  } catch (err) {
    const msg = err.code === 11000 ? 'Email already taken' : err.message
    res.status(400).json({ error: msg })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    res.json({ token: sign(user._id), user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
