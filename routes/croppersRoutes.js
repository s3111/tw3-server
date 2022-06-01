const Router = require('express')
const router = new Router()
const cropperController = require('../controllers/cropperController')

//router.post('/',deviceController.create)
router.get('/',cropperController.getAll)
//router.get('/:id',elephantController.getAll)


module.exports = router