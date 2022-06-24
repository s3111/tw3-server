const Router = require('express')
const router = new Router()

const entityRouter = require('./entityRouter')
const tweetRouter = require('./tweetRouter')
const personRouter = require('./personRoutes')
const statRouter = require('./statRoutes')

router.use('/entity', entityRouter)
router.use('/tweet', tweetRouter)
router.use('/person', personRouter)
router.use('/stat', statRouter)
module.exports = router
