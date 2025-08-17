const { Router } = require('express')
const { Cms } = require('@/controllers')

const router = Router()

router.route('/')
    .post(Cms.BrandCtrl.store)
    .get(Cms.BrandCtrl.index)

router.route('/:id')
    .get(Cms.BrandCtrl.show)
    .put(Cms.BrandCtrl.update)
    .patch(Cms.BrandCtrl.update)
    .delete(Cms.BrandCtrl.destroy)

module.exports = router