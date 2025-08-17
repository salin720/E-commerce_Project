const { Router } = require('express')
const { Cms } = require('@/controllers')

const router = Router()

router.get('/', Cms.OrderCtrl.index)

router.route('/:id')
    .put(Cms.OrderCtrl.update)
    .patch(Cms.OrderCtrl.update)
    .delete(Cms.OrderCtrl.destroy)

module.exports = router