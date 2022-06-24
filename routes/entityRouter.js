const Router = require('express')
const router = new Router()
const entityController = require('../controllers/entityController')

router.get('/types', entityController.getAllTypes)
router.get('/', entityController.getAll)

module.exports = router