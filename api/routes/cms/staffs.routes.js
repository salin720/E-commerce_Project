const { Router } = require('express')
const {Cms} = require('@/controllers')

const router = Router()

router.route('/')
    .get(Cms.StaffCtrl.index)
    .post(Cms.StaffCtrl.store)

router.route('/:id')
    .get(Cms.StaffCtrl.show)
    .put(Cms.StaffCtrl.update)
    .patch(Cms.StaffCtrl.update)
    .delete(Cms.StaffCtrl.destroy)

module.exports = router