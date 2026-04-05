import { ProductData } from "@/library/interfaces.ts"

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value))

export const getEffectivePrice = (product?: ProductData | null) => {
    if (!product) return 0
    return product.discountedPrice && product.discountedPrice > 0 ? Number(product.discountedPrice) : Number(product.price || 0)
}

const normalizeScore = (value: number, maxValue: number) => clamp(maxValue > 0 ? (value / maxValue) * 100 : 0)

export const getSmartPurchaseScore = (product?: ProductData | null) => {
    if (!product) return { score: 0, label: 'Value pending', breakdown: { pricing: 0, popularity: 0, sales: 0, rating: 0 } }

    const originalPrice = Number(product.price || 0)
    const sellingPrice = getEffectivePrice(product)
    const discountRate = originalPrice > 0 && sellingPrice < originalPrice ? ((originalPrice - sellingPrice) / originalPrice) * 100 : 0
    const views = Number(product.totalViews || 0)
    const sold = Number(product.totalSold || 0)
    const avgRating = Number(product.avgRating || 0)
    const reviewCount = Number(product.reviewCount || product.reviews?.length || 0)

    const pricing = normalizeScore(discountRate, 60) * 0.80
    const popularity = normalizeScore(views, 200) * 0.06
    const sales = normalizeScore(sold, 100) * 0.07
    const ratingBase = clamp((avgRating / 5) * 100)
    const ratingConfidenceBoost = Math.min(reviewCount * 1.5, 10)
    const rating = clamp(ratingBase * 0.9 + ratingConfidenceBoost) * 0.07

    const finalScore = Math.round(clamp(pricing + popularity + sales + rating))
    let label = 'Value pending'
    if (finalScore >= 85) label = 'Excellent value'
    else if (finalScore >= 70) label = 'Best value'
    else if (finalScore >= 55) label = 'Good deal'
    else if (finalScore >= 40) label = 'Fair value'
    else label = 'Consider options'

    return {
        score: finalScore,
        label,
        breakdown: {
            pricing: Math.round(pricing),
            popularity: Math.round(popularity),
            sales: Math.round(sales),
            rating: Math.round(rating),
        },
    }
}

export const getPriceStability = (product?: ProductData | null) => {
    if (!product) return { text: 'Price steady 0%', tone: 'stable' as const, difference: 0, differencePercent: 0, comparisonText: 'No pricing data available.' }

    const originalPrice = Number(product.price || 0)
    const sellingPrice = getEffectivePrice(product)
    const difference = Math.abs(originalPrice - sellingPrice)
    const differencePercent = originalPrice > 0 ? Math.round((difference / originalPrice) * 100) : 0

    if (originalPrice > 0 && sellingPrice < originalPrice) {
        return {
            text: `Price dropping ${differencePercent}%`,
            tone: 'down' as const,
            difference,
            differencePercent,
            comparisonText: `Currently selling ${differencePercent}% below the original listed price.`,
        }
    }

    if (originalPrice > 0 && sellingPrice > originalPrice) {
        return {
            text: `Price rising ${differencePercent}%`,
            tone: 'up' as const,
            difference,
            differencePercent,
            comparisonText: `Currently selling ${differencePercent}% above the original listed price.`,
        }
    }

    const history = Array.isArray(product.priceHistory)
        ? product.priceHistory.filter(item => Number(item?.price) > 0)
        : []

    if (history.length >= 2) {
        const last = Number(history[history.length - 1].price)
        const previous = Number(history[history.length - 2].price)
        const change = last - previous
        const recentPercent = previous > 0 ? Math.round((Math.abs(change) / previous) * 100) : 0

        if (change < 0) {
            return {
                text: `Price dropping ${recentPercent}%`,
                tone: 'down' as const,
                difference: Math.abs(change),
                differencePercent: recentPercent,
                comparisonText: `Current selling price is ${recentPercent}% lower than the recent tracked price.`,
            }
        }
        if (change > 0) {
            return {
                text: `Price rising ${recentPercent}%`,
                tone: 'up' as const,
                difference: Math.abs(change),
                differencePercent: recentPercent,
                comparisonText: `Current selling price is ${recentPercent}% higher than the recent tracked price.`,
            }
        }
    }

    return {
        text: 'Price steady 0%',
        tone: 'stable' as const,
        difference: 0,
        differencePercent: 0,
        comparisonText: originalPrice > 0 ? `Selling at the original listed price.` : 'Price is stable.',
    }
}
