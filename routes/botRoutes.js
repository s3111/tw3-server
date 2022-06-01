const Router = require('express')
const router = new Router()
const botController = require('../controllers/botController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/',authMiddleware,botController.create)
router.put('/',authMiddleware,botController.update)
router.get('/',authMiddleware,botController.getAll)
router.get('/:id',authMiddleware,botController.getOne)
router.delete('/:id',authMiddleware,botController.delete)


module.exports = router