const { Router } = require('express')
const { Front } = require('@/controllers')
const { auth, customerOnly } = require('@/library/middlewares')

const router = Router()

router.get('/trending', Front.RecommendationCtrl.trending)
router.get('/similar/:id', Front.RecommendationCtrl.similar)

router.get('/personalized', auth, customerOnly, Front.RecommendationCtrl.personalized)
router.get('/recently-viewed', auth, customerOnly, Front.RecommendationCtrl.recentlyViewed)
router.get('/buy-again', auth, customerOnly, Front.RecommendationCtrl.buyAgain)
router.get('/wishlist', auth, customerOnly, Front.RecommendationCtrl.wishlist)

module.exports = router
