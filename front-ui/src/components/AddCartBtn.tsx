import {AddCartBtnProps, CartData} from "@/library/interfaces"
import {useDispatch, useSelector} from "react-redux"
import {setCart} from "@/store"
import {toast} from "react-toastify"

export const AddCartBtn: React.FC<AddCartBtnProps> = ({product, qty = 1}) => {
  const cart : CartData = useSelector((state: any) => state.cart.value)

    const dispatch = useDispatch()

  const handleClick = () => {
    const price = product.discountedPrice > 0 ? product.discountedPrice : product.price

    let qt = qty

    if(product._id in cart){
      qt += cart[product._id].qty
    }
    const  total = qt * price

    dispatch(setCart({
        ...cart,
        [product._id]: {
            product: product,
            qty: qt,
            price: price,
            total: total
        }
    }))
    toast.success('Product added to cart.')
  }

  return <button className="btn btn-outline-dark" type="button" onClick={ handleClick}>
    <i className="fas fa-cart-plus me-2"></i> Add to cart
  </button>
}