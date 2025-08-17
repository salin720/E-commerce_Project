const { Router } = require('express')
const StaffsRoutes = require('./staffs.routes')
const CustomersRoutes = require('./customers.routes')
const CategoriesRoutes = require('./categories.routes')
const BrandsRoutes = require('./brands.routes')
const ProductRoutes = require('./products.routes')
const ReviewRoutes = require('./reviews.routes')
const OrderRoutes = require('./orders.routes')
const {adminOnly} = require("@/library/middlewares");


const router = Router()

router.use('/staffs', adminOnly, StaffsRoutes)
router.use('/customers', CustomersRoutes)
router.use('/categories', CategoriesRoutes)
router.use('/brands', BrandsRoutes)
router.use('/products', ProductRoutes)
router.use('/reviews', ReviewRoutes)
router.use('/orders', OrderRoutes)

module.exports = router
