const { Router } = require('express')
const { Front } = require('@/controllers')
const { auth, customerOnly } = require('@/library/middlewares')

const router = Router()

router.post('/search', auth, customerOnly, Front.ActivityCtrl.search)
router.post('/view', auth, customerOnly, Front.ActivityCtrl.view)
router.post('/cart', auth, customerOnly, Front.ActivityCtrl.cart)
router.post('/wishlist', auth, customerOnly, Front.ActivityCtrl.wishlist)

module.exports = router
