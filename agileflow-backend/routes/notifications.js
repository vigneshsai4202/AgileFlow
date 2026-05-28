const router = require('express').Router()
const {
  getNotifications, markRead, markAllRead, deleteNotification,
  getPreferences, updatePreferences, sendDailyDigest,
} = require('../controllers/notificationController')
const { protect } = require('../middleware/auth')

router.use(protect)
router.get('/', getNotifications)
router.put('/read-all', markAllRead)
router.put('/:id/read', markRead)
router.delete('/:id', deleteNotification)
router.get('/preferences', getPreferences)
router.put('/preferences', updatePreferences)
router.post('/send-digest', sendDailyDigest)

module.exports = router
