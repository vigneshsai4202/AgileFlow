const jwt = require('jsonwebtoken')
const User = require('../models/User')
const asyncHandler = require('../utils/asyncHandler')

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

// POST /api/auth/register  — only allowed for the very first user (becomes admin)
const register = asyncHandler(async (req, res) => {
  const count = await User.countDocuments()
  if (count > 0) {
    return res.status(403).json({ message: 'Registration is closed. Contact your admin to create an account.' })
  }

  const { name, email, password } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' })
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' })
  }

  const user = await User.create({ name, email, password, role: 'admin' })
  res.status(201).json({ user, token: generateToken(user._id) })
})

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const user = await User.findOne({ email })
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }

  res.json({ user, token: generateToken(user._id) })
})

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json(req.user)
})

// PUT /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required' })
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' })
  }

  const user = await User.findById(req.user._id)
  if (!(await user.matchPassword(currentPassword))) {
    return res.status(401).json({ message: 'Current password is incorrect' })
  }
  if (currentPassword === newPassword) {
    return res.status(400).json({ message: 'New password must be different from current password' })
  }

  user.password = newPassword
  user.mustChangePassword = false
  await user.save()

  res.json({ message: 'Password changed successfully' })
})

module.exports = { register, login, getMe, changePassword }
