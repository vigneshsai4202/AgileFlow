require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const errorHandler = require('./middleware/errorHandler')

const app = express()

connectDB()

app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }))
app.use(express.json())

app.use('/api/auth', require('./routes/auth'))
app.use('/api/users', require('./routes/users'))
app.use('/api/projects', require('./routes/projects'))
app.use('/api/tasks', require('./routes/tasks'))
app.use('/api/comments', require('./routes/comments'))
app.use('/api/sprints', require('./routes/sprints'))
app.use('/api/activity', require('./routes/activity'))
app.use('/api/reports', require('./routes/reports'))

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))
app.use((req, res) => res.status(404).json({ message: 'Route not found' }))
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
