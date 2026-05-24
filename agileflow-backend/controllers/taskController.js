const Task = require('../models/Task')
const Project = require('../models/Project')
const Activity = require('../models/Activity')
const asyncHandler = require('../utils/asyncHandler')

const log = (projectId, taskId, user, action, detail = '') =>
  Activity.create({ projectId, taskId, user, action, detail }).catch(() => {})

// GET /api/tasks/project/:projectId
const getTasksByProject = asyncHandler(async (req, res) => {
  const filter = { projectId: req.params.projectId }
  if (req.query.sprintId) filter.sprintId = req.query.sprintId
  if (req.query.type) filter.type = req.query.type
  if (req.query.priority) filter.priority = req.query.priority
  if (req.query.status) filter.status = req.query.status

  const tasks = await Task.find(filter)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .populate('sprintId', 'name')
    .sort({ createdAt: -1 })

  res.json(tasks)
})

// GET /api/tasks/search?q=&projectId=
const searchTasks = asyncHandler(async (req, res) => {
  const { q, projectId } = req.query
  if (!q) return res.json([])

  const filter = {
    title: { $regex: q, $options: 'i' },
  }
  if (projectId) filter.projectId = projectId

  const tasks = await Task.find(filter)
    .populate('assignedTo', 'name email')
    .populate('projectId', 'title')
    .limit(20)

  res.json(tasks)
})

// POST /api/tasks
const createTask = asyncHandler(async (req, res) => {
  const { title, description, type, status, priority, projectId, assignedTo, dueDate, sprintId } = req.body

  if (!title) return res.status(400).json({ message: 'Title is required' })
  if (!projectId) return res.status(400).json({ message: 'Project ID is required' })

  const project = await Project.findById(projectId)
  if (!project) return res.status(404).json({ message: 'Project not found' })

  const task = await Task.create({
    title, description, type, status, priority, projectId,
    assignedTo: assignedTo || null,
    dueDate: dueDate || null,
    sprintId: sprintId || null,
    createdBy: req.user._id,
  })

  await task.populate('assignedTo', 'name email')
  await task.populate('createdBy', 'name email')
  await task.populate('sprintId', 'name')

  log(projectId, task._id, req.user._id, 'created task', title)
  res.status(201).json(task)
})

// PUT /api/tasks/:id
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
  if (!task) return res.status(404).json({ message: 'Task not found' })

  const oldStatus = task.status
  const fields = ['title', 'description', 'type', 'status', 'priority', 'assignedTo', 'dueDate', 'sprintId']
  fields.forEach((f) => { if (req.body[f] !== undefined) task[f] = req.body[f] })

  await task.save()
  await task.populate('assignedTo', 'name email')
  await task.populate('createdBy', 'name email')
  await task.populate('sprintId', 'name')

  if (req.body.status && req.body.status !== oldStatus) {
    log(task.projectId, task._id, req.user._id, 'changed status', `${oldStatus} → ${req.body.status}`)
  } else {
    log(task.projectId, task._id, req.user._id, 'updated task', task.title)
  }

  res.json(task)
})

// DELETE /api/tasks/:id
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
  if (!task) return res.status(404).json({ message: 'Task not found' })

  log(task.projectId, task._id, req.user._id, 'deleted task', task.title)
  await task.deleteOne()
  res.json({ message: 'Task deleted' })
})

module.exports = { getTasksByProject, searchTasks, createTask, updateTask, deleteTask }
