const Comment = require('../models/Comment')
const asyncHandler = require('../utils/asyncHandler')

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
