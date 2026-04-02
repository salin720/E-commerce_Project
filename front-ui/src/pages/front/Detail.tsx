import React, { useEffect, useMemo, useState } from "react"
import { ProductData, UserType } from "@/library/interfaces.ts"
import { Loading, ProductSection } from "@/components"
import { Link, useNavigate, useParams } from "react-router-dom"
import http from "@/http"
import { dtDiff, imgUrl } from "@/library/function.ts"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "react-bootstrap"
import { setCart } from "@/store"
import { toast } from "react-toastify"

export const Detail: React.FC = () => {
    const user: UserType = useSelector((state: any) => state.user.value)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const cart = useSelector((state: any) => state.cart.value)
    const params = useParams()

    const [product, setProduct] = useState<ProductData>()
    const [similar, setSimilar] = useState<ProductData[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [bigImg, setBigImg] = useState<string>("")
    const [hoverStyle, setHoverStyle] = useState({ transformOrigin: 'center center', transform: 'scale(1)' })
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" })
    const [avgRating, setAvgRating] = useState<number>(0)
    const [starRatings, setStarRatings] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
    const [qty, setQty] = useState<number>(1)
    const [wishlist, setWishlist] = useState<string[]>(() => {
        const saved = localStorage.getItem("wishlist")
        return saved ? JSON.parse(saved) : []
    })

    useEffect(() => {
        setLoading(true)
        Promise.all([http.get(`/products/${params.id}`), http.get(`/recommendations/similar/${params.id}`)])
            .then(([{ data: { product: pData } }, { data: sData }]) => {
                setProduct(pData)
                setSimilar(sData?.products || sData?.similar || [])
                setBigImg(pData?.images?.length ? imgUrl(pData.images[0]) : "")
                if (user && params.id) {
                    http.post('/activity/view', { productId: params.id, source: 'detail_page' }).catch(() => {})
                }
            })
            .finally(() => setLoading(false))
    }, [params.id, user])

    useEffect(() => {
        if (product?.reviews && product.reviews.length > 0) {
            let tAvg = 0
            let tsRatings: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            for (let review of product.reviews) {
                const rating = Number(review.rating)
                tAvg += rating
                tsRatings[rating] += 1
            }
            for (let i in tsRatings) tsRatings[Number(i)] = (tsRatings[Number(i)] / product.reviews.length) * 100
            setAvgRating(tAvg / product.reviews.length)
            setStarRatings(tsRatings)
        } else {
            setAvgRating(0)
            setStarRatings({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
        }
    }, [product])

    const finalPrice = useMemo(() => product ? (product.discountedPrice > 0 ? product.discountedPrice : product.price) : 0, [product])

    const handleReview = (e: any) => {
        e.preventDefault()
        setLoading(true)
        http.post(`/products/${params.id}/review`, reviewForm)
            .then(() => {
                setReviewForm({ rating: 5, comment: "" })
                return http.get(`/products/${params.id}`)
            })
            .then(({ data: { product: newProduct } }) => setProduct(newProduct))
            .finally(() => setLoading(false))
    }

    const toggleWishlist = (productId: string) => {
        setWishlist((prev) => {
            let newWishlist
            if (prev.includes(productId)) {
                newWishlist = prev.filter((id) => id !== productId)
                toast.info("Removed from wishlist")
                if (user) http.post('/activity/wishlist', { productId, active: false }).catch(() => {})
            } else {
                newWishlist = [...prev, productId]
                toast.success("Added to wishlist")
                if (user) http.post('/activity/wishlist', { productId, active: true }).catch(() => {})
            }
            localStorage.setItem("wishlist", JSON.stringify(newWishlist))
            return newWishlist
        })
    }

    const handleAddToCart = () => {
        if (!user || !product) {
            toast.info("Please login to add items to cart.")
            navigate("/login")
            return
        }
        const id = product._id
        const existing = cart[id]
        const nextQty = existing ? existing.qty + qty : qty
        dispatch(setCart({ ...cart, [id]: { product, qty: nextQty, price: finalPrice, total: nextQty * finalPrice } }))
        http.post('/activity/cart', { productId: product._id, action: 'add', qty: nextQty, source: 'detail_page' }).catch(() => {})
        toast.success('Product added to cart.')
    }

    return loading ? <Loading /> : <div className="col-12 px-3 px-lg-4 py-4">
        <main className="row g-4">
            <div className="col-12">
                <div className="bg-white rounded-4 shadow-sm p-4 border-soft">
                    <div className="row g-4">
                        <div className="col-lg-5">
                            <div className="overflow-hidden border rounded-4 bg-white detail-main-image d-flex align-items-center justify-content-center">
                                <img
                                    src={bigImg || ""}
                                    alt={product?.name || "Product"}
                                    className="w-100 detail-zoom-img"
                                    style={hoverStyle as React.CSSProperties}
                                    onMouseMove={(e) => {
                                        const img = e.currentTarget
                                        const rect = img.getBoundingClientRect()
                                        const x = ((e.clientX - rect.left) / rect.width) * 100
                                        const y = ((e.clientY - rect.top) / rect.height) * 100
                                        setHoverStyle({ transformOrigin: `${x}% ${y}%`, transform: 'scale(1.8)' })
                                    }}
                                    onMouseLeave={() => setHoverStyle({ transformOrigin: 'center center', transform: 'scale(1)' })}
                                />
                            </div>
                            <div className="row g-2 mt-2">
                                {(product?.images ?? []).map((image, i) => (
                                    <div className="col-3 col-md-2" key={i}>
                                        <button className="thumb-btn w-100" onMouseEnter={() => setBigImg(imgUrl(image))} onClick={() => setBigImg(imgUrl(image))}>
                                            <img src={imgUrl(image)} className="w-100 rounded-3 border" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="col-lg-5">
                            <div className="small text-muted mb-2">{product?.category?.name || 'Product category'}</div>
                            <h1 className="product-name large mb-2">{product?.name}</h1>
                            <div className="mb-3 text-muted">By <Link to={`/brands/${product?.brandId}`}>{product?.brand?.name}</Link></div>
                            <p className="mb-3">{product?.shortDescription}</p>
                            <div className="d-flex gap-2 flex-wrap mb-3">
                                <span className="stock-pill in">{product?.stock && product.stock > 0 ? `${product.stock} available` : 'Limited stock'}</span>
                                <span className="stock-pill">{product?.totalSold || 0} sold</span>
                                <span className="stock-pill">{product?.totalViews || 0} views</span>
                            </div>
                            <div className="mb-4 p-3 rounded-4 bg-light border-soft">{product?.description}</div>
                        </div>

                        <div className="col-lg-2">
                            <div className="sidebar h-100 rounded-4 border-soft p-3 bg-light">
                                <div className="mb-3">
                                    {product?.discountedPrice && product.discountedPrice > 0 ? (
                                        <>
                                            <div className="detail-price">Rs. {product.discountedPrice}</div>
                                            <div className="detail-price-old">Rs. {product.price}</div>
                                        </>
                                    ) : <div className="detail-price">Rs. {product?.price}</div>}
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="qty" className="form-label">Quantity</label>
                                    <input type="number" id="qty" min="1" max={product?.stock || 99} value={qty} className="form-control" onChange={({ target }) => setQty(Math.max(1, Number(target.value)))} />
                                </div>
                                <div className="d-grid gap-2">
                                    <button className="btn btn-link p-0 text-start" onClick={() => product && toggleWishlist(product._id)}>
                                        <i className={`${wishlist.includes(product?._id || "") ? "fas text-danger" : "far text-secondary"} fa-heart me-2`}></i>
                                        {wishlist.includes(product?._id || "") ? 'Saved to wishlist' : 'Save to wishlist'}
                                    </button>
                                    <Button variant="dark" className="w-100" onClick={handleAddToCart}><i className="fas fa-cart-plus me-2"></i>Add to Cart</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-lg-4">
                <div className="bg-white rounded-4 shadow-sm p-4 border-soft h-100">
                    <h4 className="mb-3">Customer Ratings</h4>
                    <div className="display-6 fw-bold">{avgRating.toFixed(1)}</div>
                    <div className="text-warning mb-3">{[1,2,3,4,5].map(star => <i key={star} className={`fa-star ${avgRating >= star ? 'fas' : 'far'} me-1`}></i>)}</div>
                    {[5,4,3,2,1].map(star => (
                        <div key={star} className="mb-2">
                            <div className="d-flex justify-content-between small"><span>{star} Star</span><span>{starRatings[star].toFixed(0)}%</span></div>
                            <div className="progress" style={{height: 8}}><div className="progress-bar bg-dark" style={{width: `${starRatings[star]}%`}}></div></div>
                        </div>
                    ))}
                    {user && (
                        <div className="mt-4">
                            <h5 className="mb-3">Write a Review</h5>
                            <form onSubmit={handleReview}>
                                <div className="mb-2 text-warning fs-5">
                                    {[1,2,3,4,5].map(star => (
                                        <button type="button" key={star} className="btn btn-link p-0 me-1 text-warning" onClick={() => setReviewForm({...reviewForm, rating: star})}>
                                            <i className={`fa-star ${reviewForm.rating >= star ? 'fas' : 'far'}`}></i>
                                        </button>
                                    ))}
                                </div>
                                <textarea className="form-control mb-2" rows={4} value={reviewForm.comment} onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})} placeholder="Share your experience"></textarea>
                                <button className="btn btn-dark" type="submit">Submit Review</button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            <div className="col-lg-8">
                {!!product?.reviews?.length && (
                    <div className="bg-white rounded-4 shadow-sm p-4 border-soft h-100">
                        <h4 className="mb-3">Customer Reviews</h4>
                        {product.reviews.map(review => (
                            <div key={review._id} className="border rounded-4 p-3 mb-3">
                                <div className="d-flex justify-content-between"><strong>{review.user?.name || 'Customer'}</strong><small className="text-muted">{dtDiff(review.createdAt)}</small></div>
                                <div className="text-warning mb-2">{Array.from({length: review.rating}).map((_, i) => <i key={i} className="fas fa-star me-1"></i>)}</div>
                                <div>{review.comment}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ProductSection data={similar} title="Similar Products" size="sm" emptyText="No similar products found right now." />
        </main>
    </div>
}
