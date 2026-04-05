const { ErrorMessage, DataNotFound } = require('@/library/functions')
const { Product, Review, Brand, Category } = require('@/models')

const attachRatings = async (products = []) => {
    if (!products.length) return products
    const productIds = products.map(item => item._id)
    const ratings = await Review.aggregate([
        { $match: { productId: { $in: productIds } } },
        { $group: { _id: '$productId', avgRating: { $avg: { $toDouble: '$rating' } }, reviewCount: { $sum: 1 } } },
    ])
    const ratingMap = new Map(ratings.map(item => [String(item._id), { avgRating: Number((item.avgRating || 0).toFixed(1)), reviewCount: item.reviewCount || 0 }]))
    return products.map(item => ({ ...item, ...(ratingMap.get(String(item._id)) || { avgRating: 0, reviewCount: 0 }) }))
}
const mongoose = require('mongoose')
const { Types } = require('mongoose')
const { searchProducts, autocompleteProducts } = require('@/services/search.service')
const { getSimilarProducts, getTrendingProducts } = require('@/services/recommendation.service')

class ProductCtrl {
    latest = async (req, res, next) => {
        try {
            const latest = await attachRatings(await Product.find({ status: true }).sort({ createdAt: 'desc' }).limit(12).lean())
            res.send({ latest })
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    featured = async (req, res, next) => {
        try {
            const featured = await Product.find({ status: true, discountedPrice: { $gt: 0 } }).lean()
            const ratedFeatured = await attachRatings(featured)
            const ranked = ratedFeatured
                .filter(item => (item.price || 0) > 0 && (item.discountedPrice || 0) > 0 && item.discountedPrice < item.price)
                .map(item => ({
                    ...item,
                    _discountRate: (item.price - item.discountedPrice) / item.price,
                }))
                .sort((a, b) => b._discountRate - a._discountRate || (b.totalSold || 0) - (a.totalSold || 0) || +new Date(b.updatedAt) - +new Date(a.updatedAt))
                .slice(0, 15)
            res.send({ featured: ranked })
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    topSelling = async (req, res, next) => {
        try {
            const topSelling = await attachRatings(await getTrendingProducts(12))
            res.send({ topSelling })
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    productByID = async (req, res, next) => {
        try {
            const { id } = req.params
            let product = await Product.aggregate()
                .match({ status: true, _id: new Types.ObjectId(id) })
                .lookup({ from: 'brands', localField: 'brandId', foreignField: '_id', as: 'brand' })
                .lookup({ from: 'categories', localField: 'categoryId', foreignField: '_id', as: 'category' })

            product = product[0]

            if (product) {
                let reviews = await Review.aggregate()
                    .match({ productId: new mongoose.Types.ObjectId(id) })
                    .lookup({ from: 'users', localField: 'userId', foreignField: '_id', as: 'user' })
                for (let i in reviews) {
                    reviews[i].user = reviews[i].user[0]
                }
                const avgRating = reviews.length ? Number((reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.length).toFixed(1)) : 0
                product = {
                    ...product,
                    brand: product.brand[0],
                    category: product.category[0],
                    reviews,
                    avgRating,
                    reviewCount: reviews.length,
                }
                res.send({ product })
            } else {
                DataNotFound(next, "Product")
            }
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    productByCategoryID = async (req, res, next) => {
        try {
            const { id } = req.params
            const products = await attachRatings(await Product.find({ status: true, categoryId: id }).sort({ totalSold: -1, createdAt: -1 }).lean())
            res.send(products)
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    productByBrandID = async (req, res, next) => {
        try {
            const { id } = req.params
            const products = await attachRatings(await Product.find({ status: true, brandId: id }).sort({ totalSold: -1, createdAt: -1 }).lean())
            res.send(products)
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    search = async (req, res, next) => {
        try {
            const { term = '', limit = 24 } = req.query
            const results = await searchProducts(term, { limit: Number(limit) })
            res.send({
                product: await attachRatings(results.products),
                products: await attachRatings(results.products),
                meta: {
                    normalizedQuery: results.normalizedQuery,
                    tokens: results.tokens,
                    count: results.products.length,
                },
            })
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    autocomplete = async (req, res, next) => {
        try {
            const { term = '', limit = 8 } = req.query
            const results = await autocompleteProducts(term, { limit: Number(limit) })
            res.send(results)
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    similar = async (req, res, next) => {
        try {
            const { id } = req.params
            const similar = await attachRatings(await getSimilarProducts(id, { limit: Number(req.query.limit || 8) }))
            res.send({ similar, products: similar })
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    review = async (req, res, next) => {
        try {
            const { id } = req.params
            const { rating, comment } = req.body
            await Review.create({ productId: id, rating, comment, userId: req.user._id })
            res.send({ message: 'Thank you for your review!' })
        } catch (error) {
            ErrorMessage(next, error)
        }
    }
}

module.exports = new ProductCtrl()
