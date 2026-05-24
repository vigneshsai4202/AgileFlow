const Task = require('../models/Task')
const Project = require('../models/Project')
const asyncHandler = require('../utils/asyncHandler')

// GET /api/tasks/project/:projectId
const getTasksByProject = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ projectId: req.params.projectId })
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })

  res.json(tasks)
})

// POST /api/tasks
const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, projectId, assignedTo, dueDate } = req.body

  if (!title) return res.status(400).json({ message: 'Title is required' })
  if (!projectId) return res.status(400).json({ message: 'Project ID is required' })

  const project = await Project.findById(projectId)
  if (!project) return res.status(404).json({ message: 'Project not found' })

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    projectId,
    assignedTo: assignedTo || null,
    dueDate: dueDate || null,
    createdBy: req.user._id,
  })

  await task.populate('assignedTo', 'name email')
  await task.populate('createdBy', 'name email')
  res.status(201).json(task)
})

// PUT /api/tasks/:id
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
  if (!task) return res.status(404).json({ message: 'Task not found' })

  const fields = ['title', 'description', 'status', 'priority', 'assignedTo', 'dueDate']
  fields.forEach((f) => {
    if (req.body[f] !== undefined) task[f] = req.body[f]
  })

  await task.save()
  await task.populate('assignedTo', 'name email')
  await task.populate('createdBy', 'name email')
  res.json(task)
})

// DELETE /api/tasks/:id
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
  if (!task) return res.status(404).json({ message: 'Task not found' })

  await task.deleteOne()
  res.json({ message: 'Task deleted' })
})

module.exports = { getTasksByProject, createTask, updateTask, deleteTask }
