const {Router} = require('express')
const {Front} = require ('@/controllers')
const {auth, customerOnly} = require("@/library/middlewares");

const router = Router()

router.get('/categories', Front.MixCtrl.categories)

router.get('/categories/:id', Front.MixCtrl.categoryByID)

router.get('/categories/:id/products', Front.ProductCtrl.productByCategoryID)

router.get('/brands', Front.MixCtrl.brands)

router.get('/brands/:id', Front.MixCtrl.brandByID)

router.get('/brands/:id/products', Front.ProductCtrl.productByBrandID)

router.post('/checkout', auth, customerOnly, Front.MixCtrl.checkout)

router.get('/image/:filename', Front.MixCtrl.images)


module.exports = router