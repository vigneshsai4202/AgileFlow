const router = require('express').Router()
const { getSprints, createSprint, updateSprint, deleteSprint } = require('../controllers/sprintController')
const { protect } = require('../middleware/auth')

router.use(protect)
router.get('/project/:projectId', getSprints)
router.post('/', createSprint)
router.route('/:id').put(updateSprint).delete(deleteSprint)

module.exports = router
