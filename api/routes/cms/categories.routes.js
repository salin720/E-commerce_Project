const { Router } = require('express')
const {Cms} = require('@/controllers')
const { upload } = require('@/library/middlewares')

const router = Router()

router.route('/')
    .post(upload().single('image'), Cms.CategoryCtrl.store)
    .get(Cms.CategoryCtrl.index)

router.route('/:id')
    .get(Cms.CategoryCtrl.show)
    .put(upload().single('image'), Cms.CategoryCtrl.update)
    .patch(upload().single('image'), Cms.CategoryCtrl.update)
    .delete(Cms.CategoryCtrl.destroy)

module.exports = router