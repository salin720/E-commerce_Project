const { Product, Category, Brand } = require('@/models')

const normalizeQuery = (value = '') => value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const tokenize = (value = '') => normalizeQuery(value).split(' ').filter(Boolean)

const buildSearchIndex = async () => {
    const [categories, brands] = await Promise.all([
        Category.find({ status: true }).lean(),
        Brand.find({ status: true }).lean(),
    ])

    return {
        categoryMap: new Map(categories.map(item => [String(item._id), item.name])),
        brandMap: new Map(brands.map(item => [String(item._id), item.name])),
    }
}

const scoreProduct = ({ product, categoryName, brandName, tokens, normalizedQuery }) => {
    const searchable = {
        name: (product.name || '').toLowerCase(),
        shortDescription: (product.shortDescription || '').toLowerCase(),
        description: (product.description || '').toLowerCase(),
        category: (categoryName || '').toLowerCase(),
        brand: (brandName || '').toLowerCase(),
    }

    let score = 0

    if (normalizedQuery && searchable.name === normalizedQuery) score += 100
    if (normalizedQuery && searchable.brand === normalizedQuery) score += 70
    if (normalizedQuery && searchable.category === normalizedQuery) score += 60
    if (normalizedQuery && searchable.name.includes(normalizedQuery)) score += 45
    if (normalizedQuery && searchable.shortDescription.includes(normalizedQuery)) score += 18
    if (normalizedQuery && searchable.description.includes(normalizedQuery)) score += 10

    for (const token of tokens) {
        if (searchable.name.startsWith(token)) score += 30
        if (searchable.name.includes(token)) score += 22
        if (searchable.brand.includes(token)) score += 18
        if (searchable.category.includes(token)) score += 16
        if (searchable.shortDescription.includes(token)) score += 8
        if (searchable.description.includes(token)) score += 4
    }

    if (product.featured) score += 8
    if ((product.totalSold || 0) > 0) score += Math.min(product.totalSold, 25)
    if ((product.totalViews || 0) > 0) score += Math.min(Math.floor(product.totalViews / 5), 15)
    if ((product.discountedPrice || 0) > 0) score += 4
    if ((product.stock || 0) > 0) score += 6

    return score
}

const searchProducts = async (term, { limit = 20 } = {}) => {
    const normalizedQuery = normalizeQuery(term)
    const tokens = tokenize(term)

    if (!normalizedQuery) {
        return { products: [], normalizedQuery, tokens }
    }

    const products = await Product.find({ status: true }).lean()
    const { categoryMap, brandMap } = await buildSearchIndex()

    const ranked = products
        .map(product => {
            const categoryName = categoryMap.get(String(product.categoryId)) || ''
            const brandName = brandMap.get(String(product.brandId)) || ''
            return {
                ...product,
                categoryName,
                brandName,
                _score: scoreProduct({ product, categoryName, brandName, tokens, normalizedQuery }),
            }
        })
        .filter(product => product._score > 0)
        .sort((a, b) => b._score - a._score || (b.totalSold || 0) - (a.totalSold || 0) || (b.totalViews || 0) - (a.totalViews || 0))
        .slice(0, limit)

    return { products: ranked, normalizedQuery, tokens }
}

const autocompleteProducts = async (term, { limit = 8 } = {}) => {
    const normalizedQuery = normalizeQuery(term)
    const tokens = tokenize(term)

    if (!normalizedQuery) return { suggestions: [], keywords: [] }

    const suggestions = await searchProducts(term, { limit: 20 })

    const unique = new Map()
    for (const product of suggestions.products) {
        const key = String(product._id)
        if (!unique.has(key)) {
            unique.set(key, {
                _id: product._id,
                name: product.name,
                brandName: product.brandName,
                categoryName: product.categoryName,
                image: Array.isArray(product.images) && product.images.length ? product.images[0] : null,
                score: product._score,
            })
        }
    }

    const keywordSuggestions = []
    for (const token of tokens) {
        if (token && token !== normalizedQuery) keywordSuggestions.push(token)
    }
    keywordSuggestions.push(normalizedQuery)

    return {
        suggestions: Array.from(unique.values()).slice(0, limit),
        keywords: Array.from(new Set(keywordSuggestions)).slice(0, 5),
    }
}

module.exports = { normalizeQuery, tokenize, searchProducts, autocompleteProducts }
