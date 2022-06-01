const Router = require('express')
const router = new Router()
const accController = require('../controllers/accController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/',authMiddleware,accController.create)
router.put('/',authMiddleware,accController.update)
router.get('/',authMiddleware,accController.getAll)
//router.get('/:id',authMiddleware,botController.getOne)
//router.delete('/:id',authMiddleware,botController.delete)


module.exports = router