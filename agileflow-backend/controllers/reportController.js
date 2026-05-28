const Task = require('../models/Task')
const Sprint = require('../models/Sprint')
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

// GET /api/reports/sprint/:sprintId  — burndown + summary for one sprint
const getSprintReport = asyncHandler(async (req, res) => {
  const sprint = await Sprint.findById(req.params.sprintId)
  if (!sprint) return res.status(404).json({ message: 'Sprint not found' })

  const tasks = await Task.find({ sprintId: sprint._id })
  const total = tasks.length
  const completed = tasks.filter((t) => t.status === 'Done').length
  const inProgress = tasks.filter((t) => t.status === 'In Progress').length
  const todo = tasks.filter((t) => t.status === 'Todo').length

  // Burndown: remaining tasks per day across sprint duration
  const start = new Date(sprint.startDate)
  const end = new Date(sprint.endDate)
  const today = new Date()
  const chartEnd = end < today ? end : today

  const burndown = []
  let remaining = total
  for (let d = new Date(start); d <= chartEnd; d.setDate(d.getDate() + 1)) {
    const dayStr = d.toDateString()
    const completedOnDay = tasks.filter((t) => {
      if (t.status !== 'Done') return false
      return new Date(t.updatedAt).toDateString() === dayStr
    }).length
    remaining -= completedOnDay
    burndown.push({
      label: new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      remaining: Math.max(0, remaining),
      ideal: Math.round(total - (total * ((new Date(d) - start) / (end - start + 1)))),
    })
  }

  res.json({
    sprint: { name: sprint.name, status: sprint.status, startDate: sprint.startDate, endDate: sprint.endDate, goal: sprint.goal },
    total, completed, inProgress, todo,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    burndown,
  })
})

// GET /api/reports/velocity/:projectId  — velocity across all sprints
const getVelocityReport = asyncHandler(async (req, res) => {
  const sprints = await Sprint.find({ projectId: req.params.projectId }).sort({ startDate: 1 })

  const velocity = await Promise.all(
    sprints.map(async (s) => {
      const tasks = await Task.find({ sprintId: s._id })
      const completed = tasks.filter((t) => t.status === 'Done').length
      const total = tasks.length
      return {
        sprintName: s.name,
        completed,
        total,
        status: s.status,
      }
    })
  )

  const completedSprints = velocity.filter((v) => v.status === 'Completed')
  const avgVelocity = completedSprints.length > 0
    ? Math.round(completedSprints.reduce((sum, v) => sum + v.completed, 0) / completedSprints.length)
    : 0

  res.json({ velocity, avgVelocity })
})

module.exports = { getProjectReport, getSprintReport, getVelocityReport }
