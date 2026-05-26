require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const app = express()

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((o) => o.trim())
  : ['http://localhost:3000']

app.use(cors({ origin: allowedOrigins }))
app.use(express.json())

app.use('/api/auth', require('./routes/auth'))
app.use('/api/workouts', require('./routes/workouts'))

app.get('/api/health', (_, res) => res.json({ ok: true }))

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    const port = process.env.PORT || 4000
    app.listen(port, () => console.log(`Server running on :${port}`))
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message)
    process.exit(1)
  })
