const router = require('express').Router()
const { createEmployee, getUsers, getUsersWithTasks, deleteUser, updateUserRole } = require('../controllers/userController')
const { protect } = require('../middleware/auth')

router.get('/', protect, getUsers)
router.post('/create', protect, createEmployee)
router.get('/with-tasks', protect, getUsersWithTasks)
router.delete('/:id', protect, deleteUser)
router.put('/:id/role', protect, updateUserRole)

module.exports = router
