const Router = require('express')
const router = new Router()
const elephantController = require('../controllers/elephantController')

//router.post('/',deviceController.create)
router.get('/',elephantController.getAll)
//router.get('/:id',elephantController.getAll)


module.exports = router