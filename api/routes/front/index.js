const {Router} = require('express')
const productsRoutes = require('./products.routes')
const mixRoutes = require('./mix.routes')
const paymentRoutes = require("./payment.routes")
const recommendationRoutes = require('./recommendation.routes')
const activityRoutes = require('./activity.routes')

const router = Router()

router.use('/products', productsRoutes)
router.use('/recommendations', recommendationRoutes)
router.use('/activity', activityRoutes)
router.use(mixRoutes)
router.use("/payments", paymentRoutes)

module.exports = router
