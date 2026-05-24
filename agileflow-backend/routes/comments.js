const router = require('express').Router()
const { getComments, addComment, deleteComment } = require('../controllers/commentController')
const { protect } = require('../middleware/auth')

router.use(protect)
router.get('/:taskId', getComments)
router.post('/:taskId', addComment)
router.delete('/:id', deleteComment)

module.exports = router
