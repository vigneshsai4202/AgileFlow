const mongoose = require('mongoose')

const sprintSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['Planning', 'Active', 'Completed'], default: 'Planning' },
    goal: { type: String, default: '' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Sprint', sprintSchema)
