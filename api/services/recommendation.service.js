const { Product, SearchHistory, ProductView, CartActivity, Wishlist, Order, Detail } = require('@/models')
const { normalizeQuery } = require('./search.service')

const recencyWeight = (date) => {
    if (!date) return 0
    const days = (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
    if (days <= 3) return 1.25
    if (days <= 7) return 1.15
    if (days <= 30) return 1
    if (days <= 90) return 0.7
    return 0.45
}

const addScore = (map, key, value) => {
    if (!key || !value) return
    map.set(String(key), (map.get(String(key)) || 0) + value)
}

const buildUserProfile = async (userId) => {
    const [searches, views, cartActions, wishlists, orders] = await Promise.all([
        SearchHistory.find({ userId }).sort({ createdAt: -1 }).limit(50).lean(),
        ProductView.find({ userId }).sort({ viewedAt: -1 }).limit(100).lean(),
        CartActivity.find({ userId }).sort({ createdAt: -1 }).limit(50).lean(),
        Wishlist.find({ userId, active: true }).sort({ updatedAt: -1 }).limit(50).lean(),
        Order.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
    ])

    const orderIds = orders.map(order => order._id)
    const details = orderIds.length ? await Detail.find({ orderId: { $in: orderIds } }).lean() : []
    const purchasedProductIds = details.map(item => String(item.productId))

    const interactedProductIds = new Set([
        ...views.map(item => String(item.productId)),
        ...cartActions.filter(item => item.action === 'add').map(item => String(item.productId)),
        ...wishlists.map(item => String(item.productId)),
        ...purchasedProductIds,
    ])

    const interactedProducts = interactedProductIds.size
        ? await Product.find({ _id: { $in: Array.from(interactedProductIds) } }).lean()
        : []

    const productMap = new Map(interactedProducts.map(product => [String(product._id), product]))
    const categoryScores = new Map()
    const brandScores = new Map()
    const productScores = new Map()
    const keywords = new Map()
    const budgets = []

    for (const search of searches) {
        const weight = 10 * recencyWeight(search.createdAt || search.searchedAt)
        const tokens = normalizeQuery(search.query).split(' ').filter(Boolean)
        tokens.forEach(token => addScore(keywords, token, weight))
    }

    for (const view of views) {
        const weight = 14 * recencyWeight(view.viewedAt)
        addScore(productScores, view.productId, weight)
        addScore(categoryScores, view.categoryId, weight)
        addScore(brandScores, view.brandId, weight * 0.8)
        const product = productMap.get(String(view.productId))
        if (product) budgets.push(product.discountedPrice > 0 ? product.discountedPrice : product.price)
    }

    for (const cart of cartActions) {
        const weight = (cart.action === 'add' ? 24 : -8) * recencyWeight(cart.createdAt)
        addScore(productScores, cart.productId, weight)
        const product = productMap.get(String(cart.productId))
        if (product) {
            addScore(categoryScores, product.categoryId, weight)
            addScore(brandScores, product.brandId, weight * 0.75)
            budgets.push(product.discountedPrice > 0 ? product.discountedPrice : product.price)
        }
    }

    for (const wish of wishlists) {
        const weight = 18 * recencyWeight(wish.updatedAt)
        addScore(productScores, wish.productId, weight)
        const product = productMap.get(String(wish.productId))
        if (product) {
            addScore(categoryScores, product.categoryId, weight)
            addScore(brandScores, product.brandId, weight * 0.7)
            budgets.push(product.discountedPrice > 0 ? product.discountedPrice : product.price)
        }
    }

    for (const detail of details) {
        const order = orders.find(item => String(item._id) === String(detail.orderId))
        const weight = (35 + (detail.qty || 1) * 4) * recencyWeight(order?.createdAt)
        addScore(productScores, detail.productId, weight)
        const product = productMap.get(String(detail.productId))
        if (product) {
            addScore(categoryScores, product.categoryId, weight)
            addScore(brandScores, product.brandId, weight * 0.85)
            budgets.push(detail.price)
        }
    }

    const averageBudget = budgets.length ? budgets.reduce((sum, value) => sum + value, 0) / budgets.length : null

    return {
        categoryScores,
        brandScores,
        productScores,
        keywords,
        averageBudget,
        purchasedProductIds,
        hasHistory: Boolean(searches.length || views.length || cartActions.length || wishlists.length || details.length),
    }
}

const getTrendingProducts = async (limit = 12) => {
    return Product.find({ status: true })
        .sort({ totalSold: -1, totalViews: -1, featured: -1, createdAt: -1 })
        .limit(limit)
        .lean()
}

const getRecommendationsForUser = async (userId, { limit = 12, excludePurchased = true } = {}) => {
    const profile = await buildUserProfile(userId)

    if (!profile.hasHistory) {
        return {
            strategy: 'trending_fallback',
            products: await getTrendingProducts(limit),
            profile: { averageBudget: null, topKeywords: [] },
        }
    }

    const candidates = await Product.find({ status: true }).lean()
    const keywordEntries = Array.from(profile.keywords.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8)

    const ranked = candidates
        .filter(product => (product.stock || 1) > 0)
        .filter(product => !excludePurchased || !profile.purchasedProductIds.includes(String(product._id)))
        .map(product => {
            let score = 0
            score += profile.categoryScores.get(String(product.categoryId)) || 0
            score += profile.brandScores.get(String(product.brandId)) || 0
            score += (profile.productScores.get(String(product._id)) || 0) * 0.6

            const searchableText = `${product.name} ${product.shortDescription || ''} ${product.description || ''}`.toLowerCase()
            for (const [keyword, keywordScore] of keywordEntries) {
                if (searchableText.includes(keyword)) score += keywordScore * 0.9
            }

            const actualPrice = product.discountedPrice > 0 ? product.discountedPrice : product.price
            if (profile.averageBudget) {
                const diffRatio = Math.abs(actualPrice - profile.averageBudget) / Math.max(profile.averageBudget, 1)
                if (diffRatio <= 0.15) score += 12
                else if (diffRatio <= 0.35) score += 6
            }

            if (product.featured) score += 6
            score += Math.min(product.totalSold || 0, 20)
            score += Math.min(Math.floor((product.totalViews || 0) / 10), 10)
            if (product.discountedPrice > 0) score += 4

            return { ...product, recommendationScore: Number(score.toFixed(2)) }
        })
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, limit)

    return {
        strategy: 'hybrid_weighted',
        products: ranked,
        profile: { averageBudget: profile.averageBudget, topKeywords: keywordEntries.map(([keyword]) => keyword) },
    }
}

const getSimilarProducts = async (productId, { limit = 8 } = {}) => {
    const source = await Product.findById(productId).lean()
    if (!source) return []
    const products = await Product.find({ status: true, _id: { $ne: productId }, categoryId: source.categoryId }).lean()
    const sourcePrice = source.discountedPrice > 0 ? source.discountedPrice : source.price

    return products.map(product => {
            let score = 0
            if (String(product.categoryId) === String(source.categoryId)) score += 55
            if (String(product.brandId) === String(source.brandId)) score += 20
            const price = product.discountedPrice > 0 ? product.discountedPrice : product.price
            const diffRatio = Math.abs(price - sourcePrice) / Math.max(sourcePrice, 1)
            if (diffRatio <= 0.15) score += 16
            else if (diffRatio <= 0.35) score += 10
            const sourceWords = new Set(normalizeQuery(`${source.name} ${source.shortDescription}`).split(' ').filter(Boolean))
            const targetWords = normalizeQuery(`${product.name} ${product.shortDescription}`).split(' ').filter(Boolean)
            let overlap = 0
            targetWords.forEach(word => { if (sourceWords.has(word)) overlap += 1 })
            score += Math.min(overlap * 4, 16)
            score += Math.min(product.totalSold || 0, 8)
            return { ...product, similarityScore: score }
        })
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, limit)
}

module.exports = { getRecommendationsForUser, getTrendingProducts, getSimilarProducts }
