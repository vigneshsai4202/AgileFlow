const mongoose = require('mongoose')

const activitySchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true }, // e.g. 'created task', 'changed status'
    detail: { type: String, default: '' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Activity', activitySchema)
