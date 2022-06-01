const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/registration',userController.registration)
router.get('/activation/:link',userController.activate)
router.post('/login',userController.login)
router.post('/resetpass',userController.resetPassReq)
router.post('/newpass',userController.newPassReq)
router.get('/auth',authMiddleware,userController.check)
router.get('/info',authMiddleware,userController.info)
router.post('/checkout',authMiddleware,userController.checkout)
router.post('/payment',userController.payment)

module.exports = router