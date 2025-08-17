const { Router } = require('express')
const {Cms} = require('@/controllers')

const router = Router()

router.route('/')
    .get(Cms.CustomerCtrl.index)
    .post(Cms.CustomerCtrl.store)

router.route('/:id')
    .get(Cms.CustomerCtrl.show)
    .put(Cms.CustomerCtrl.update)
    .patch(Cms.CustomerCtrl.update)
    .delete(Cms.CustomerCtrl.destroy)

module.exports = router