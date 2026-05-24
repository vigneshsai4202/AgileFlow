const User = require('../models/User')
const Task = require('../models/Task')
const asyncHandler = require('../utils/asyncHandler')

// GET /api/users  — all users (any logged-in user, for assign dropdown)
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('name email role').sort({ name: 1 })
  res.json(users)
})

// GET /api/users/with-tasks  — admin: each user + their assigned tasks
const getUsersWithTasks = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' })
  }

  const users = await User.find().select('name email role createdAt').sort({ name: 1 })

  const usersWithTasks = await Promise.all(
    users.map(async (u) => {
      const tasks = await Task.find({ assignedTo: u._id })
        .populate('projectId', 'title')
        .select('title status priority dueDate projectId')
        .sort({ createdAt: -1 })
      return { ...u.toObject(), tasks }
    })
  )

  res.json(usersWithTasks)
})

// DELETE /api/users/:id  — admin only
const deleteUser = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' })
  }
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ message: 'Cannot delete yourself' })
  }

  const user = await User.findByIdAndDelete(req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })

  res.json({ message: 'User deleted' })
})

// PUT /api/users/:id/role  — admin only
const updateUserRole = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' })
  }

  const { role } = req.body
  if (!['admin', 'member'].includes(role)) {
    return res.status(400).json({ message: 'Role must be admin or member' })
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  ).select('name email role')

  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json(user)
})

module.exports = { getUsers, getUsersWithTasks, deleteUser, updateUserRole }
