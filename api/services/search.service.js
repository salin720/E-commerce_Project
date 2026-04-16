const { Product, Category, Brand } = require('@/models')

const normalizeQuery = (value = '') => value.toLowerCase().replace(/[^a-z0-9\s-]/gi, ' ').replace(/\s+/g, ' ').trim()
const tokenize = (value = '') => normalizeQuery(value).split(' ').filter(Boolean)


const hasWholeWord = (text = '', token = '') => {
    if (!text || !token) return false
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i').test(text)
}

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

/* ==============================================================
   ALGORITHM: Smart Product Search & Filtering Algorithm
   Formula:
   Search Score = (Exact Match × 100) + (Primary Match × 60) +
                  (Token Match × 25) + (Popularity Boost)
   ============================================================== */
const scoreProduct = ({ product, categoryName, brandName, tokens, normalizedQuery }) => {
    const searchable = {
        name: (product.name || '').toLowerCase(),
        shortDescription: (product.shortDescription || '').toLowerCase(),
        description: (product.description || '').toLowerCase(),
        category: (categoryName || '').toLowerCase(),
        brand: (brandName || '').toLowerCase(),
    }
    const nameTokens = tokenize(searchable.name)
    const categoryTokens = tokenize(searchable.category)
    const brandTokens = tokenize(searchable.brand)
    const combinedTokens = new Set([...nameTokens, ...categoryTokens, ...brandTokens])
    let score = 0
    let exactTokenMatches = 0

    if (normalizedQuery && searchable.name === normalizedQuery) score += 120
    if (normalizedQuery && searchable.category === normalizedQuery) score += 110
    if (normalizedQuery && searchable.brand === normalizedQuery) score += 105

    for (const token of tokens) {
        if (hasWholeWord(searchable.name, token)) { score += 42; exactTokenMatches += 1 }
        if (hasWholeWord(searchable.category, token)) { score += 34; exactTokenMatches += 1 }
        if (hasWholeWord(searchable.brand, token)) { score += 30; exactTokenMatches += 1 }
    }

    const allTokensCovered = tokens.every(token => hasWholeWord(searchable.name, token) || hasWholeWord(searchable.category, token) || hasWholeWord(searchable.brand, token))
    if (!allTokensCovered || exactTokenMatches === 0) return 0

    if (normalizedQuery && searchable.name.startsWith(normalizedQuery)) score += 16
    score += Math.min(product.totalSold || 0, 12)
    score += Math.min(Math.floor((product.totalViews || 0) / 10), 8)
    if (product.featured) score += 5
    if ((product.stock || 0) > 0) score += 3
    return score
}

const searchProducts = async (term, { limit = 20 } = {}) => {
    const normalizedQuery = normalizeQuery(term)
    const tokens = tokenize(term)
    if (!normalizedQuery) return { products: [], normalizedQuery, tokens }

    const products = await Product.find({ status: true }).lean()
    const { categoryMap, brandMap } = await buildSearchIndex()

    const ranked = products.map(product => {
        const categoryName = categoryMap.get(String(product.categoryId)) || ''
        const brandName = brandMap.get(String(product.brandId)) || ''
        return { ...product, categoryName, brandName, _score: scoreProduct({ product, categoryName, brandName, tokens, normalizedQuery }) }
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
        if (!unique.has(key)) unique.set(key, { _id: product._id, name: product.name, brandName: product.brandName, categoryName: product.categoryName, image: Array.isArray(product.images) && product.images.length ? product.images[0] : null, score: product._score })
    }
    const keywordSuggestions = [...new Set([...tokens.filter(token => token && token !== normalizedQuery), normalizedQuery])].slice(0, 5)
    return { suggestions: Array.from(unique.values()).slice(0, limit), keywords: keywordSuggestions }
}

module.exports = { normalizeQuery, tokenize, searchProducts, autocompleteProducts }
