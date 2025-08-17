const { Router } = require('express')
const {Cms } = require('@/controllers')

const router = Router()

router.route('/')
    .post(Cms.CategoryCtrl.store)
    .get(Cms.CategoryCtrl.index)

router.route('/:id')
    .get(Cms.CategoryCtrl.show)
    .put(Cms.CategoryCtrl.update)
    .patch(Cms.CategoryCtrl.update)
    .delete(Cms.CategoryCtrl.destroy)

module.exports = router