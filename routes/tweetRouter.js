const Router = require('express')
const router = new Router()
const tweetController = require('../controllers/tweetController')

router.get('/', tweetController.getAll)

module.exports = router