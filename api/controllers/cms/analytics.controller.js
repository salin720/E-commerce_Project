const {Product, User, Detail, Order} = require('@/models')
const {ErrorMessage} = require('@/library/functions')

// Helper to parse dates and interval
function parseRange(query){
  const { from, to, interval } = query || {}
  const toDate = to ? new Date(to) : new Date()
  const fromDate = from ? new Date(from) : new Date(toDate.getTime() - 30*24*60*60*1000)
  const allowed = ['day','week','month','year']
  const unit = allowed.includes(interval) ? interval : 'day'
  return { fromDate, toDate, unit }
}

function dateTruncStage(field, unit){
  return { $dateTrunc: { date: `$${field}`, unit } }
}

function formatPeriod(field){
  // Produce ISO date string (YYYY-MM-DD) for the bucket start.
  return { $dateToString: { format: '%Y-%m-%d', date: field } }
}

async function aggProducts(fromDate, toDate, unit){
  return Product.aggregate([
    { $match: { createdAt: { $gte: fromDate, $lte: toDate } } },
    { $group: { _id: dateTruncStage('createdAt', unit), count: { $sum: 1 } } },
    { $project: { _id: 0, period: formatPeriod('$_id'), count: 1 } },
    { $sort: { period: 1 } },
  ])
}

async function aggSales(fromDate, toDate, unit){
  return Detail.aggregate([
    { $lookup: { from: 'orders', localField: 'orderId', foreignField: '_id', as: 'order' } },
    { $unwind: '$order' },
    { $match: { 'order.createdAt': { $gte: fromDate, $lte: toDate }, 'order.status': { $ne: 'Cancelled' } } },
    { $group: {
      _id: dateTruncStage('order.createdAt', unit),
      productsSold: { $sum: '$qty' },
      revenue: { $sum: { $cond: [{ $or: [ { $eq: ['$order.paymentStatus', 'Paid'] }, { $eq: ['$order.paymentMethod', 'COD'] } ] }, '$total', 0] } }
    } },
    { $project: {
      _id: 0,
      period: formatPeriod('$_id'),
      productsSold: 1,
      revenue: 1
    } },
    { $sort: { period: 1 } },
  ])
}

async function aggOrders(fromDate, toDate, unit){
  return Order.aggregate([
    { $match: { createdAt: { $gte: fromDate, $lte: toDate }, status: { $ne: 'Cancelled' } } },
    { $group: { _id: dateTruncStage('createdAt', unit), ordersCount: { $sum: 1 } } },
    { $project: { _id: 0, period: formatPeriod('$_id'), ordersCount: 1 } },
    { $sort: { period: 1 } },
  ])
}

async function aggCustomers(fromDate, toDate, unit){
  return User.aggregate([
    { $match: { role: 'Customer', createdAt: { $gte: fromDate, $lte: toDate } } },
    { $group: { _id: dateTruncStage('createdAt', unit), newCustomers: { $sum: 1 } } },
    { $project: { _id: 0, period: formatPeriod('$_id'), newCustomers: 1 } },
    { $sort: { period: 1 } },
  ])
}

class AnalyticsController {
  timeseries = async (req, res, next) => {
    try{
      const { fromDate, toDate, unit } = parseRange(req.query)

      const [productsAgg, salesAgg, customersAgg, ordersAgg] = await Promise.all([
        aggProducts(fromDate, toDate, unit),
        aggSales(fromDate, toDate, unit),
        aggCustomers(fromDate, toDate, unit),
        aggOrders(fromDate, toDate, unit),
      ])

      const map = new Map()
      const add = (arr, fields) => arr.forEach(item => {
        if(!map.has(item.period)) map.set(item.period, { period: item.period })
        for(const f of fields){ map.get(item.period)[f] = item[f] || 0 }
      })

      add(productsAgg, ['count'])
      add(salesAgg, ['productsSold','revenue'])
      add(customersAgg, ['newCustomers'])
      add(ordersAgg, ['ordersCount'])

      let buckets = Array.from(map.values()).sort((a,b) => a.period.localeCompare(b.period))

      // Compute customersTotal cumulatively, starting with base before fromDate
      const baseTotal = await User.countDocuments({ role: 'Customer', createdAt: { $lt: fromDate } })
      let running = baseTotal
      buckets = buckets.map(b => {
        running += b.newCustomers || 0
        return {
          period: b.period,
          productsAdded: b.count || 0,
          productsSold: b.productsSold || 0,
          revenue: b.revenue || 0,
          newCustomers: b.newCustomers || 0,
          customersTotal: running,
          ordersCount: b.ordersCount || 0,
        }
      })

      res.send({ buckets })
    } catch (error){
      ErrorMessage(next, error)
    }
  }

  overview = async (req, res, next) => {
    try{
      const { fromDate, toDate } = parseRange(req.query)

      const [productsAdded, salesSummary, newCustomers, customersTotal, ordersCount] = await Promise.all([
        Product.countDocuments({ createdAt: { $gte: fromDate, $lte: toDate } }),
        Detail.aggregate([
          { $lookup: { from: 'orders', localField: 'orderId', foreignField: '_id', as: 'order' } },
          { $unwind: '$order' },
          { $match: { 'order.createdAt': { $gte: fromDate, $lte: toDate }, 'order.status': { $ne: 'Cancelled' } } },
          { $group: { _id: null, productsSold: { $sum: '$qty' }, revenue: { $sum: { $cond: [{ $or: [ { $eq: ['$order.paymentStatus', 'Paid'] }, { $eq: ['$order.paymentMethod', 'COD'] } ] }, '$total', 0] } } } },
          { $project: { _id: 0, productsSold: 1, revenue: 1 } }
        ]).then(arr => arr[0] || { productsSold: 0, revenue: 0 }),
        User.countDocuments({ role: 'Customer', createdAt: { $gte: fromDate, $lte: toDate } }),
        User.countDocuments({ role: 'Customer', createdAt: { $lte: toDate } }),
        Order.countDocuments({ createdAt: { $gte: fromDate, $lte: toDate }, status: { $ne: 'Cancelled' } }),
      ])

      res.send({
        productsAdded,
        productsSold: salesSummary.productsSold,
        revenue: salesSummary.revenue,
        profit: salesSummary.profit,
        loss: salesSummary.loss,
        newCustomers,
        customersTotal,
        ordersCount,
      })
    } catch (error){
      ErrorMessage(next, error)
    }
  }
}

module.exports = new AnalyticsController()
