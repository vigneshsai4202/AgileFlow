const Sprint = require('../models/Sprint')
const Task = require('../models/Task')
const asyncHandler = require('../utils/asyncHandler')

// GET /api/sprints/project/:projectId
const getSprints = asyncHandler(async (req, res) => {
  const sprints = await Sprint.find({ projectId: req.params.projectId }).sort({ createdAt: -1 })
  res.json(sprints)
})

// POST /api/sprints
const createSprint = asyncHandler(async (req, res) => {
  const { name, projectId, startDate, endDate, goal } = req.body
  if (!name || !projectId || !startDate || !endDate) {
    return res.status(400).json({ message: 'name, projectId, startDate, endDate are required' })
  }
  const sprint = await Sprint.create({ name, projectId, startDate, endDate, goal })
  res.status(201).json(sprint)
})

// PUT /api/sprints/:id
const updateSprint = asyncHandler(async (req, res) => {
  const sprint = await Sprint.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!sprint) return res.status(404).json({ message: 'Sprint not found' })
  res.json(sprint)
})

// DELETE /api/sprints/:id
const deleteSprint = asyncHandler(async (req, res) => {
  const sprint = await Sprint.findByIdAndDelete(req.params.id)
  if (!sprint) return res.status(404).json({ message: 'Sprint not found' })
  await Task.updateMany({ sprintId: sprint._id }, { sprintId: null })
  res.json({ message: 'Sprint deleted' })
})

module.exports = { getSprints, createSprint, updateSprint, deleteSprint }
