const { ErrorMessage } = require('@/library/functions')
const { getRecommendationsForUser, getTrendingProducts, getSimilarProducts } = require('@/services/recommendation.service')
const { ProductView, Wishlist, Detail, Order, Product, Review } = require('@/models')

const attachRatings = async (products = []) => {
    if (!products.length) return products
    const ratings = await Review.aggregate([
        { $match: { productId: { $in: products.map(item => item._id) } } },
        { $group: { _id: '$productId', avgRating: { $avg: { $toDouble: '$rating' } }, reviewCount: { $sum: 1 } } },
    ])
    const ratingMap = new Map(ratings.map(item => [String(item._id), { avgRating: Number((item.avgRating || 0).toFixed(1)), reviewCount: item.reviewCount || 0 }]))
    return products.map(item => ({ ...item, ...(ratingMap.get(String(item._id)) || { avgRating: 0, reviewCount: 0 }) }))
}

class RecommendationController {
    personalized = async (req, res, next) => {
        try {
            const limit = Number(req.query.limit || 12)
            const data = await getRecommendationsForUser(req.user._id, { limit })
            res.send({ ...data, products: await attachRatings(data.products || []) })
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    trending = async (req, res, next) => {
        try {
            const limit = Number(req.query.limit || 12)
            const products = await attachRatings(await getTrendingProducts(limit))
            res.send({ strategy: 'trending', products })
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    similar = async (req, res, next) => {
        try {
            const limit = Number(req.query.limit || 8)
            const products = await attachRatings(await getSimilarProducts(req.params.id, { limit }))
            res.send({ strategy: 'similarity', products, similar: products })
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    recentlyViewed = async (req, res, next) => {
        try {
            const views = await ProductView.find({ userId: req.user._id }).sort({ viewedAt: -1 }).limit(Number(req.query.limit || 10)).lean()
            const productIds = [...new Set(views.map(item => String(item.productId)))]
            const products = productIds.length ? await Product.find({ _id: { $in: productIds }, status: true }).lean() : []
            const rated = await attachRatings(products)
            const productMap = new Map(rated.map(product => [String(product._id), product]))
            const ordered = productIds.map(id => productMap.get(id)).filter(Boolean)
            res.send({ products: ordered })
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    buyAgain = async (req, res, next) => {
        try {
            const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20).lean()
            const orderIds = orders.map(item => item._id)
            const details = orderIds.length ? await Detail.find({ orderId: { $in: orderIds } }).sort({ createdAt: -1 }).lean() : []
            const productIds = [...new Set(details.map(item => String(item.productId)))]
            const products = productIds.length ? await Product.find({ _id: { $in: productIds }, status: true }).lean() : []
            res.send({ products: await attachRatings(products) })
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    wishlist = async (req, res, next) => {
        try {
            const wishlist = await Wishlist.find({ userId: req.user._id, active: true }).sort({ updatedAt: -1 }).lean()
            const productIds = wishlist.map(item => item.productId)
            const products = productIds.length ? await Product.find({ _id: { $in: productIds }, status: true }).lean() : []
            res.send({ products: await attachRatings(products) })
        } catch (error) {
            ErrorMessage(next, error)
        }
    }
}

module.exports = new RecommendationController()
