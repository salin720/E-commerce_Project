const { SearchHistory, ProductView, CartActivity, Wishlist, Product } = require('@/models')
const { normalizeQuery } = require('./search.service')

const trackSearch = async ({ userId, query, resultCount = 0, clickedProductId = null }) => {
    if (!userId || !query) return null
    return SearchHistory.create({
        userId,
        query,
        normalizedQuery: normalizeQuery(query),
        resultCount,
        clickedProductId,
        searchedAt: new Date(),
    })
}

const trackView = async ({ userId, productId, source = 'detail' }) => {
    if (!userId || !productId) return null
    const product = await Product.findById(productId).lean()
    if (!product) return null
    await Product.findByIdAndUpdate(productId, { $inc: { totalViews: 1 } })
    return ProductView.create({
        userId,
        productId,
        categoryId: product.categoryId,
        brandId: product.brandId,
        source,
        viewedAt: new Date(),
    })
}

const trackCart = async ({ userId, productId, action, qty = 1, source = 'cart' }) => {
    if (!userId || !productId || !action) return null
    return CartActivity.create({ userId, productId, action, qty, source })
}

const trackWishlist = async ({ userId, productId, active = true }) => {
    if (!userId || !productId) return null
    return Wishlist.findOneAndUpdate(
        { userId, productId },
        { active },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    )
}

module.exports = { trackSearch, trackView, trackCart, trackWishlist }
