const router = require('express').Router()
const { getProjectReport, getSprintReport, getVelocityReport } = require('../controllers/reportController')
const { protect } = require('../middleware/auth')

router.get('/project/:projectId', protect, getProjectReport)
router.get('/sprint/:sprintId', protect, getSprintReport)
router.get('/velocity/:projectId', protect, getVelocityReport)

module.exports = router
