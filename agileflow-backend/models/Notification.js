const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['assignment', 'comment', 'status_change', 'task_update'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Notification', notificationSchema)
