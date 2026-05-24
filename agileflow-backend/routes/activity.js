const router = require('express').Router()
const { getActivity } = require('../controllers/activityController')
const { protect } = require('../middleware/auth')

router.get('/:projectId', protect, getActivity)

module.exports = router
