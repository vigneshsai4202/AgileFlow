const router = require('express').Router()
const { getProjectReport } = require('../controllers/reportController')
const { protect } = require('../middleware/auth')

router.get('/project/:projectId', protect, getProjectReport)

module.exports = router
