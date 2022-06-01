const Router = require('express')
const router = new Router()
const entityController = require('../controllers/entityController')

//router.post('/',deviceController.create)
router.get('/types',entityController.getAllTypes)
router.get('/',entityController.getAll)
//router.get('/:name',entityController.getOne)
//router.get('/:id',elephantController.getAll)


module.exports = router