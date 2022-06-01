const Router = require('express')
const router = new Router()
const tweetController = require('../controllers/tweetController')

//router.post('/',deviceController.create)
router.get('/',tweetController.getAll)
//router.get('/:id',elephantController.getAll)


module.exports = router