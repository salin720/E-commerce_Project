const { Router } = require('express')
const {Profile} = require("@/controllers")
const {auth} = require('@/library/middlewares')

const router = new Router()

router.get('/details', auth, Profile.ProfileCtrl.show)

router.route('/update')
      .put(Profile.ProfileCtrl.edit)
      .patch(Profile.ProfileCtrl.edit)

router.route('/password')
    .put(Profile.ProfileCtrl.password)
    .patch(Profile.ProfileCtrl.password)

router.get('/reviews', Profile.ProfileCtrl.reviews)

router.get('/orders', Profile.ProfileCtrl.orders)

module.exports = router