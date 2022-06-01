const Router = require('express')
const router = new Router()
const personController = require('../controllers/personController')

//router.post('/',deviceController.create)
//router.get('/types',entityController.getAllTypes)
router.get('/',personController.getAll)
router.get('/:name',personController.getOne)
//router.get('/:id',elephantController.getAll)


module.exports = router