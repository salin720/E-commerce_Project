const {Router} = require('express')
const authRoutes = require('./auth.routes')
const profileRoutes = require('./profile.routes')
const cmsRoutes = require('./cms')
const frontRoutes = require('./front')
const {auth, cmsUsers} = require('@/library/middlewares')
const {DataNotFound} = require("@/library/functions");
const paymentRoutes = require("./payment.routes");


const router = Router()

router.use('/auth', authRoutes)

router.use('/profile', auth,  profileRoutes)

router.use('/cms', auth, cmsUsers, cmsRoutes)

router.use(frontRoutes)

router.use("/payment", paymentRoutes);

// Must be last
router.use((req,res,next) => {
    DataNotFound(next,'URL')
})

module.exports = router