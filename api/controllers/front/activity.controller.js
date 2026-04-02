const { ErrorMessage } = require('@/library/functions')
const { trackSearch, trackView, trackCart, trackWishlist } = require('@/services/activity.service')

class ActivityController {
    search = async (req, res, next) => {
        try {
            const { query, resultCount = 0, clickedProductId = null } = req.body
            await trackSearch({ userId: req.user._id, query, resultCount, clickedProductId })
            res.send({ message: 'Search activity tracked.' })
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    view = async (req, res, next) => {
        try {
            const { productId, source = 'detail' } = req.body
            await trackView({ userId: req.user._id, productId, source })
            res.send({ message: 'View activity tracked.' })
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    cart = async (req, res, next) => {
        try {
            const { productId, action, qty = 1, source = 'cart' } = req.body
            await trackCart({ userId: req.user._id, productId, action, qty, source })
            res.send({ message: 'Cart activity tracked.' })
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    wishlist = async (req, res, next) => {
        try {
            const { productId, active = true } = req.body
            const wishlist = await trackWishlist({ userId: req.user._id, productId, active })
            res.send({ message: active ? 'Wishlist saved.' : 'Wishlist removed.', wishlist })
        } catch (error) {
            ErrorMessage(next, error)
        }
    }
}

module.exports = new ActivityController()
