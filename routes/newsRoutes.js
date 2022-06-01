const Router = require('express')
const router = new Router()
const newsController = require('../controllers/newsController')
//const authMiddleware = require('../middleware/authMiddleware')

router.get('/',newsController.getAll)
module.exports = router