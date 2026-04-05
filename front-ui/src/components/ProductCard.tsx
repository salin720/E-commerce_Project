import { ProductData, UserType } from "@/library/interfaces.ts"
import { getPriceStability, getSmartPurchaseScore } from "@/library/productInsights.ts"
import { imgUrl } from "@/library/function.ts"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { setCart } from "@/store"
import { toast } from "react-toastify"
import http from "@/http"

export const ProductCard: React.FC<{ product: ProductData }> = ({ product }) => {
    const user: UserType = useSelector((state: any) => state.user.value)
    const cart = useSelector((state: any) => state.cart.value)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const finalPrice = product.discountedPrice > 0 ? product.discountedPrice : product.price
    const discountPercent = product.discountedPrice > 0 ? Math.round(((product.price - product.discountedPrice) / product.price) * 100) : 0
    const { score } = getSmartPurchaseScore(product)
    const priceStability = getPriceStability(product)
    const avgRating = Number(product.avgRating || 0)
    const reviewCount = Number(product.reviewCount || 0)

    const handleAddToCart = () => {
        if (!user) {
            toast.info("Please login to add items to cart.")
            navigate("/login")
            return
        }
        const id = product._id
        const existing = cart[id]
        const qty = existing ? existing.qty + 1 : 1
        dispatch(setCart({ ...cart, [id]: { product, qty, price: finalPrice, total: finalPrice * qty } }))
        http.post('/activity/cart', { productId: product._id, action: 'add', qty, source: 'product_card' }).catch(() => {})
        toast.success(`${product.name} added to cart.`)
    }

    return (
        <div className="col">
            <div className="product-card-real h-100">
                <Link to={`/products/${product._id}`} className="product-image-wrap">
                    <img src={imgUrl(product.images?.[0])} className="product-image-real" alt={product.name} />
                    {product.featured && <span className="badge-featured">Featured</span>}
                    {discountPercent > 0 && <span className="badge-sale">-{discountPercent}%</span>}
                </Link>
                <div className="product-card-body">
                    <div className="small text-muted mb-1">{product.brand?.name || 'Quick Cart'}</div>
                    <Link to={`/products/${product._id}`} className="product-name-real">{product.name}</Link>
                    <div className="product-meta-real">
                        <span>{product.totalSold || 0} sold</span>
                        <span>•</span>
                        <span>{product.totalViews || 0} views</span>
                    </div>
                    <div className="product-insights-row product-insights-inline product-insights-tight">
                        <span className="insight-chip insight-score">Score: {score}/100</span>
                        <span className={`insight-chip insight-${priceStability.tone}`}>
                            <i className={`fas ${priceStability.tone === 'up' ? 'fa-arrow-trend-up' : priceStability.tone === 'down' ? 'fa-arrow-trend-down' : 'fa-wave-square'} me-1`}></i>
                            {priceStability.text}
                        </span>
                    </div>
                    <div className="product-rating-row mb-2">
                        <span className="text-warning">{[1,2,3,4,5].map((star) => {
                            const iconClass = avgRating >= star ? "fas fa-star" : avgRating >= star - 0.5 ? "fas fa-star-half-alt" : "far fa-star"
                            return <i key={star} className={`${iconClass} me-1`}></i>
                        })}</span>
                        <span className="small text-muted">{avgRating ? avgRating.toFixed(1) : "0.0"} {reviewCount > 0 ? `(${reviewCount})` : "(0)"}</span>
                    </div>
                    <div className="d-flex align-items-end gap-2 mb-2 flex-wrap">
                        <span className="price-real">Rs. {finalPrice}</span>
                        {discountPercent > 0 && <span className="price-old-real">Rs. {product.price}</span>}
                    </div>
                    <div className="d-flex justify-content-between align-items-center gap-2 mt-auto">
                        <span className={`stock-pill ${(product.stock || 0) > 0 ? 'in' : 'low'}`}>
                            {(product.stock || 0) > 0 ? `${product.stock} in stock` : 'Low stock'}
                        </span>
                        <button className="btn btn-dark btn-sm" onClick={handleAddToCart}>Add</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
