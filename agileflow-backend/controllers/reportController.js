const Task = require('../models/Task')
const asyncHandler = require('../utils/asyncHandler')

// GET /api/reports/project/:projectId
const getProjectReport = asyncHandler(async (req, res) => {
  const { projectId } = req.params
  const tasks = await Task.find({ projectId }).populate('assignedTo', 'name')

  const total = tasks.length
  const byStatus = { Todo: 0, 'In Progress': 0, Done: 0 }
  const byPriority = { Low: 0, Medium: 0, High: 0 }
  const byType = { Task: 0, Bug: 0, Story: 0, Epic: 0 }
  const byMember = {}

  tasks.forEach((t) => {
    byStatus[t.status] = (byStatus[t.status] || 0) + 1
    byPriority[t.priority] = (byPriority[t.priority] || 0) + 1
    byType[t.type] = (byType[t.type] || 0) + 1
    if (t.assignedTo) {
      const name = t.assignedTo.name
      byMember[name] = (byMember[name] || 0) + 1
    }
  })

  // Burndown: tasks completed per day (last 14 days)
  const now = new Date()
  const burndown = []
  for (let i = 13; i >= 0; i--) {
    const day = new Date(now)
    day.setDate(day.getDate() - i)
    const label = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const done = tasks.filter((t) => {
      if (t.status !== 'Done') return false
      const updated = new Date(t.updatedAt)
      return updated.toDateString() === day.toDateString()
    }).length
    burndown.push({ label, done })
  }

  res.json({ total, byStatus, byPriority, byType, byMember, burndown })
})

module.exports = { getProjectReport }
