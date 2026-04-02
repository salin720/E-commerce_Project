const {Router} = require('express')
const {Front} = require ('@/controllers')
const {customerOnly, auth} = require("@/library/middlewares")

const router = Router()

router.get('/latest', Front.ProductCtrl.latest)
router.get('/featured', Front.ProductCtrl.featured)
router.get('/top-selling', Front.ProductCtrl.topSelling)
router.get('/search', Front.ProductCtrl.search)
router.get('/autocomplete', Front.ProductCtrl.autocomplete)
router.get('/:id', Front.ProductCtrl.productByID)
router.get('/:id/similar', Front.ProductCtrl.similar)
router.post('/:id/review', auth, customerOnly, Front.ProductCtrl.review)

module.exports = router
