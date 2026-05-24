const router = require('express').Router()
const { getTasksByProject, searchTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController')
const { protect } = require('../middleware/auth')

router.use(protect)
router.get('/search', searchTasks)
router.get('/project/:projectId', getTasksByProject)
router.post('/', createTask)
router.route('/:id').put(updateTask).delete(deleteTask)

module.exports = router
