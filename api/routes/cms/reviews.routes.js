const { Router } = require('express')
const { Cms } = require('@/controllers')

const router = Router()

router.get('/', Cms.ReviewCtrl.index)
router.delete('/:id', Cms.ReviewCtrl.destroy)

module.exports = router