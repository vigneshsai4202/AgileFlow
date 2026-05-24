const Activity = require('../models/Activity')
const asyncHandler = require('../utils/asyncHandler')

// GET /api/activity/:projectId
const getActivity = asyncHandler(async (req, res) => {
  const logs = await Activity.find({ projectId: req.params.projectId })
    .populate('user', 'name')
    .populate('taskId', 'title')
    .sort({ createdAt: -1 })
    .limit(50)
  res.json(logs)
})

module.exports = { getActivity }
