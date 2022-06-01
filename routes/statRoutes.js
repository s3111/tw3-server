const Router = require('express')
const router = new Router()
const statController = require('../controllers/statController')

//router.post('/',deviceController.create)
//router.get('/types',entityController.getAllTypes)
router.get('/',statController.getAll)
//router.get('/:name',entityController.getOne)
//router.get('/:id',elephantController.getAll)


module.exports = router