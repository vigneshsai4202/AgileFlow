const Notification = require('../models/Notification')
const User = require('../models/User')
const Task = require('../models/Task')
const asyncHandler = require('../utils/asyncHandler')
const { sendEmail, digestEmail } = require('../utils/emailService')

// GET /api/notifications  — current user's notifications
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
  res.json(notifications)
})

// PUT /api/notifications/:id/read
const markRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { read: true }
  )
  res.json({ success: true })
})

// PUT /api/notifications/read-all
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, read: false }, { read: true })
  res.json({ success: true })
})

// DELETE /api/notifications/:id
const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
  res.json({ success: true })
})

// GET /api/notifications/preferences
const getPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('notificationPrefs')
  res.json(user.notificationPrefs || {})
})

// PUT /api/notifications/preferences
const updatePreferences = asyncHandler(async (req, res) => {
  const { emailOnAssign, emailOnComment, emailOnChange, dailyDigest } = req.body
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { notificationPrefs: { emailOnAssign, emailOnComment, emailOnChange, dailyDigest } },
    { new: true }
  ).select('notificationPrefs')
  res.json(user.notificationPrefs)
})

// POST /api/notifications/send-digest  — called by a cron/scheduler or manually
const sendDailyDigest = asyncHandler(async (req, res) => {
  const users = await User.find({ 'notificationPrefs.dailyDigest': true }).select('name email notificationPrefs')

  let sent = 0
  for (const user of users) {
    const tasks = await Task.find({ assignedTo: user._id, status: { $ne: 'Done' } })
      .populate('projectId', 'title')
      .select('title status priority projectId')
      .limit(20)

    if (tasks.length > 0) {
      const { subject, html } = digestEmail(user.name, tasks)
      await sendEmail(user.email, subject, html)
      sent++
    }
  }

  res.json({ message: `Digest sent to ${sent} user(s)` })
})

module.exports = { getNotifications, markRead, markAllRead, deleteNotification, getPreferences, updatePreferences, sendDailyDigest }
