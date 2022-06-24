const Router = require('express')
const router = new Router()
const personController = require('../controllers/personController')

router.get('/', personController.getAll)
router.get('/:name', personController.getOne)

module.exports = router