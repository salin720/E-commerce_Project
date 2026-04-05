const { Router } = require('express')
const { Cms } = require('@/controllers')
const { upload } = require('@/library/middlewares')

const router = Router()

router.route('/')
    .post(upload().single('image'), Cms.BrandCtrl.store)
    .get(Cms.BrandCtrl.index)

router.route('/:id')
    .get(Cms.BrandCtrl.show)
    .put(upload().single('image'), Cms.BrandCtrl.update)
    .patch(upload().single('image'), Cms.BrandCtrl.update)
    .delete(Cms.BrandCtrl.destroy)

module.exports = router