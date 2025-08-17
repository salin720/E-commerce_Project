const { Router } = require('express')
const { Cms } = require('@/controllers')
const { upload } = require('@/library/middlewares')

const router = Router()

router.route('/')
    .post(upload().array('images'), Cms.ProductCtrl.store)
    .get(Cms.ProductCtrl.index)

router.route('/:id')
    .get(Cms.ProductCtrl.show)
    .put(upload().array('images'), Cms.ProductCtrl.update)
    .patch(upload().array('images'), Cms.ProductCtrl.update)
    .delete(Cms.ProductCtrl.destroy)

router.delete('/:id/image/:filename', Cms.ProductCtrl.deleteImage)

module.exports = router
