const { Router } = require('express')
const { Cms } = require('@/controllers')

const router = Router()

router.get('/overview', Cms.AnalyticsCtrl.overview)
router.get('/timeseries', Cms.AnalyticsCtrl.timeseries)

module.exports = router
