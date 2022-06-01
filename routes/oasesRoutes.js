const Router = require('express')
const router = new Router()
const oasesController = require('../controllers/oasesController')

//router.post('/',deviceController.create)
router.get('/',oasesController.getAll)
//router.get('/:id',elephantController.getAll)


module.exports = router