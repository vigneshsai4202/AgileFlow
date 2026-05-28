const Comment = require('../models/Comment')
const Task = require('../models/Task')
const Notification = require('../models/Notification')
const User = require('../models/User')
const asyncHandler = require('../utils/asyncHandler')
const { sendEmail, commentEmail } = require('../utils/emailService')

// GET /api/comments/:taskId
const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ taskId: req.params.taskId })
    .populate('author', 'name email')
    .sort({ createdAt: 1 })
  res.json(comments)
})

// POST /api/comments/:taskId
const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body
  if (!text?.trim()) return res.status(400).json({ message: 'Comment text is required' })

  const comment = await Comment.create({
    taskId: req.params.taskId,
    author: req.user._id,
    text,
  })
  await comment.populate('author', 'name email')

  // Notify task assignee and creator (excluding the commenter)
  const task = await Task.findById(req.params.taskId).select('title assignedTo createdBy projectId')
  if (task) {
    const toNotify = [...new Set(
      [task.assignedTo, task.createdBy]
        .filter(Boolean)
        .map(String)
        .filter((id) => id !== req.user._id.toString())
    )]
    for (const uid of toNotify) {
      Notification.create({
        userId: uid, type: 'comment',
        title: 'New Comment',
        message: `${req.user.name} commented on "${task.title}"`,
        taskId: task._id, projectId: task.projectId,
      }).catch(() => {})
      const recipient = await User.findById(uid).select('name email notificationPrefs')
      if (recipient?.notificationPrefs?.emailOnComment !== false) {
        const { subject, html } = commentEmail(recipient.name, req.user.name, task.title, text)
        sendEmail(recipient.email, subject, html)
      }
    }
  }

  res.status(201).json(comment)
})

// DELETE /api/comments/:id
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id)
  if (!comment) return res.status(404).json({ message: 'Comment not found' })
  if (comment.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' })
  }
  await comment.deleteOne()
  res.json({ message: 'Comment deleted' })
})

module.exports = { getComments, addComment, deleteComment }
