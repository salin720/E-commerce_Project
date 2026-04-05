const { Router } = require('express')
const {Profile} = require("@/controllers")
const { upload } = require('@/library/middlewares')

const router = new Router()

router.get('/details', Profile.ProfileCtrl.show)
router.route('/update').put(Profile.ProfileCtrl.edit).patch(Profile.ProfileCtrl.edit)
router.route('/password').put(Profile.ProfileCtrl.password).patch(Profile.ProfileCtrl.password)
router.get('/reviews', Profile.ProfileCtrl.reviews)
router.get('/orders', Profile.ProfileCtrl.orders)
router.delete('/orders/:id', Profile.ProfileCtrl.deleteOrderHistory)
router.post('/upload-avatar', upload().single('avatar'), Profile.ProfileCtrl.uploadAvatar)
router.delete('/remove-avatar', Profile.ProfileCtrl.removeAvatar)

module.exports = router
