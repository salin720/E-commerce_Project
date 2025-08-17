import { ProductData, UserType } from "@/library/interfaces.ts"
import { imgUrl } from "@/library/function.ts"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "react-bootstrap"
import { setCart } from "@/store"
import { toast } from "react-toastify"

export const ProductCard: React.FC<{ product: ProductData }> = ({ product }) => {
    const user: UserType = useSelector((state: any) => state.user.value)
    const cart = useSelector((state: any) => state.cart.value)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleAddToCart = () => {
        if (!user) {
            toast.info("Please login to add items to cart.")
            navigate("/login")
            return
        }

        const id = product._id
        const existing = cart[id]
        const qty = existing ? existing.qty + 1 : 1
        const price = product.discountedPrice > 0 ? product.discountedPrice : product.price
        const total = price * qty

        dispatch(setCart({
            ...cart,
            [id]: {
                product,
                qty,
                price,
                total
            }
        }))

        toast.success(`${product.name} added to cart.`)
    }

    return (
        <div className="col my-3">
            <div className="col-12 bg-white text-center h-100 product-item p-3 shadow-sm rounded d-flex flex-column">
                {/* Product Image */}
                <div className="mb-3">
                    <Link to={`/products/${product._id}`}>
                        <img
                            src={imgUrl(product.images[0])}
                            className="img-fluid product-image"
                            alt={product.name}
                        />
                    </Link>
                </div>

                {/* Product Details */}
                <div className="flex-grow-1 d-flex flex-column justify-content-between">
                    <div className="mb-2">
                        <Link to={`/products/${product._id}`} className="product-name fw-bold text-dark d-block mb-2">
                            {product.name}
                        </Link>

                        {product.discountedPrice > 0 ? (
                            <>
                                <span className="text-muted text-decoration-line-through">
                                    Rs. {product.price}
                                </span><br />
                                <span className="product-price fs-5 fw-semibold">
                                    Rs. {product.discountedPrice}
                                </span>
                            </>
                        ) : (
                            <span className="product-price fs-5 fw-semibold">
                                Rs. {product.price}
                            </span>
                        )}
                    </div>

                    <div className="col-12 mb-3 align-self-end">
                        <Button variant="outline-dark" onClick={handleAddToCart}>
                            <i className="fas fa-cart-plus me-2"></i>Add to Cart
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
