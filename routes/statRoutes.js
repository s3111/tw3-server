const Router = require('express')
const router = new Router()
const statController = require('../controllers/statController')

router.get('/entities', statController.getTopEntities)
router.get('/report', statController.getReport)
router.get('/', statController.getAll)
//router.get('/:name',entityController.getOne)

module.exports = router