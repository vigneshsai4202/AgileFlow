const Project = require('../models/Project')
const Task = require('../models/Task')
const asyncHandler = require('../utils/asyncHandler')

// GET /api/projects
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    $or: [{ createdBy: req.user._id }, { members: req.user._id }],
  })
    .populate('createdBy', 'name email')
    .populate('members', 'name email')
    .sort({ createdAt: -1 })

  res.json(projects)
})

// GET /api/projects/:id
const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('members', 'name email')

  if (!project) return res.status(404).json({ message: 'Project not found' })
  res.json(project)
})

// POST /api/projects
const createProject = asyncHandler(async (req, res) => {
  const { title, description } = req.body
  if (!title) return res.status(400).json({ message: 'Title is required' })

  const project = await Project.create({
    title,
    description,
    createdBy: req.user._id,
    members: [req.user._id],
  })

  await project.populate('createdBy', 'name email')
  res.status(201).json(project)
})

// PUT /api/projects/:id
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
  if (!project) return res.status(404).json({ message: 'Project not found' })

  if (project.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to update this project' })
  }

  const { title, description, members } = req.body
  if (title) project.title = title
  if (description !== undefined) project.description = description
  if (members) {
    // Always keep the creator as a member
    const creatorId = project.createdBy.toString()
    const hasCreator = members.some((m) => m.toString() === creatorId)
    project.members = hasCreator ? members : [creatorId, ...members]
  }

  await project.save()
  await project.populate('createdBy', 'name email')
  await project.populate('members', 'name email')
  res.json(project)
})

// DELETE /api/projects/:id
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
  if (!project) return res.status(404).json({ message: 'Project not found' })

  if (project.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to delete this project' })
  }

  await Task.deleteMany({ projectId: project._id })
  await project.deleteOne()
  res.json({ message: 'Project deleted' })
})

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject }
