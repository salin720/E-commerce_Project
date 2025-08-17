// import {CartData, ProductData} from "@/library/interfaces.ts"
// import {useDispatch, useSelector} from "react-redux"
// import {useEffect, useState} from "react"
// import {imgUrl} from "@/library/function.ts"
// import {clearCart, setCart} from "@/store"
// import {Loading} from "@/components";
// import http from "@/http";
// import {useNavigate} from "react-router-dom"
//
// export const Cart: React.FC = () => {
//     const cart: CartData = useSelector((state: any )=> state.cart.value)
//     const [totalQty, setTotalQty] = useState<number>(0)
//     const [totalPrice, setTotalPrice] = useState<number>(0)
//     const [loading, setLoading] = useState<boolean>(false)
//
//     const dispatch = useDispatch()
//     const navigate = useNavigate()
//
//     useEffect(() => {
//         let tq = 0, tp = 0
//
//         if (cart && typeof cart === 'object' && Object.keys(cart).length > 0) {
//             for (let id in cart) {
//                 const item = cart[id]
//                 const qty = Number(item?.qty) || 0
//                 const total = Number(item?.total) || 0
//
//                 tq += qty
//                 tp += total
//             }
//         }
//
//         setTotalQty(tq)
//         setTotalPrice(tp)
//     }, [cart])
//
//     const handleClearCart = () => {
//         dispatch(clearCart())
//     }
//
//     const handleQtyChange = (id: string, qty: number) => {
//
//         const product: ProductData = cart[id]?.product
//         const price = product.discountedPrice > 0 ? product.discountedPrice : product.price
//         const total = price * qty
//
//         dispatch(setCart({
//             ...cart,
//             [id]: {
//                 ...cart[id],
//                 qty,
//                 price,
//                 total
//             }
//         }))
//     }
//
//     const handleRemove = (id: string) => {
//         let temp: CartData = {}
//
//         for (let i in cart) {
//             if (id !== i) {
//                 temp = {
//                     ...temp,
//                     [i]: cart[i]
//                 }
//             }
//         }
//         if (Object.keys(temp).length > 0) {
//             dispatch(setCart(temp))
//         } else {
//             dispatch(clearCart())
//         }
//     }
//
//     const handleCheckout = () => {
//         setLoading(true)
//
//         let data = []
//         for (let i in cart) {
//             data.push({
//                 productId: i,
//                 qty: cart[i].qty,
//             })
//         }
//         http.post('/checkout', {cart: data})
//             .then(() => {
//                 dispatch(clearCart())
//                 navigate('/profile')
//             })
//             .catch(() => {})
//             .finally(() => {
//                 setLoading(false)
//             })
//     }
//
//     return loading ? <Loading /> : <>
//         <div className="col-12">
//             <div className="row">
//                 <div className="col-12 mt-3 text-center text-uppercase">
//                     <h2>Shopping Cart</h2>
//                 </div>
//             </div>
//
//             <main className="row">
//                 <div className="col-12 bg-white py-3 mb-3">
//                     <div className="row">
//                         <div className="col-lg-6 col-md-8 col-sm-10 mx-auto table-responsive">
//                             {Object.keys(cart).length > 0 ? <div className="row">
//                                 <div className="col-12">
//                                     <table className="table table-striped table-hover table-sm">
//                                         <thead>
//                                         <tr>
//                                             <th>Product</th>
//                                             <th>Price</th>
//                                             <th>Qty</th>
//                                             <th>Amount</th>
//                                             <th></th>
//                                         </tr>
//                                         </thead>
//                                         <tbody>
//                                            {/*{Object.keys(cart).map(id => <tr key={id}>*/}
//                                            {/*     <td>*/}
//                                            {/*         <img src={imgUrl(cart[id].product.images[0])}*/}
//                                            {/*              className="img-fluid me-3"/>*/}
//                                            {/*         {cart[id].product.name}*/}
//                                            {/*     </td>*/}
//                                            {/*     <td>*/}
//                                            {/*         Rs. {cart[id].price}*/}
//                                            {/*     </td>*/}
//                                            {/*     <td>*/}
//                                            {/*         <input type="number" min="1" value={cart[id].qty}/>*/}
//                                            {/*     </td>*/}
//                                            {/*     <td>*/}
//                                            {/*         Rs. {cart[id].total}*/}
//                                            {/*     </td>*/}
//                                            {/*     <td>*/}
//                                            {/*         <button className="btn btn-link text-danger"><i*/}
//                                            {/*             className="fas fa-times"></i></button>*/}
//                                            {/*     </td>*/}
//                                            {/*</tr>)}*/}
//
//                                            {Object.keys(cart).map(id => {
//                                                const item = cart[id];
//                                                const product = item?.product;
//
//                                                if (!product || !product.images) return null;
//                                                return (
//                                                    <tr key={id}>
//                                                        <td>
//                                                            <img
//                                                                src={product.images[0] ? imgUrl(product.images[0]) : "/default.png"}
//                                                                className="img-fluid me-3"
//                                                                alt={product.name || "Product"}
//                                                            />
//                                                            {product.name}
//                                                        </td>
//                                                        <td>Rs. {item.price}</td>
//                                                        <td>
//                                                            <input type="number" min="1" value={item.qty}
//                                                                   onChange={(e) => handleQtyChange(id, Number(e.target.value))}
//                                                            />
//                                                        </td>
//                                                        <td>Rs. {item.total}</td>
//                                                        <td>
//                                                            <button className="btn btn-link text-danger"
//                                                            onClick={() => handleRemove(id)}>
//                                                                <i className="fas fa-times"></i>
//                                                            </button>
//                                                        </td>
//                                                    </tr>
//                                                )
//                                            })}
//
//                                         </tbody>
//                                         <tfoot>
//                                         <tr>
//                                             <th colSpan={2} className="text-right">Total</th>
//                                             <th>{totalQty}</th>
//                                             <th>{totalPrice}</th>
//                                             <th></th>
//                                         </tr>
//                                         </tfoot>
//                                     </table>
//                                 </div>
//                                 <div className="col-12 text-right">
//                                     <button className="btn btn-outline-secondary me-3" type="submit"
//                                     onClick={handleClearCart}>Clear Cart</button>
//                                     <button className="btn btn-outline-success"
//                                     onClick={handleCheckout}>Checkout</button>
//                                 </div>
//                             </div> : <h4 className="text-center">Cart is empty</h4>}
//                         </div>
//                     </div>
//                 </div>
//
//             </main>
//         </div>
//     </>
// }

import { CartData, ProductData } from "@/library/interfaces.ts";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { imgUrl } from "@/library/function.ts";
import { clearCart, setCart } from "@/store";
import { Loading } from "@/components";
import http from "@/http";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const Cart: React.FC = () => {
    const cart: CartData = useSelector((state: any) => state.cart.value);
    const user = useSelector((state: any) => state.user.value); // Assumes you store user in Redux
    const [totalQty, setTotalQty] = useState<number>(0);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        let tq = 0, tp = 0;

        if (cart && typeof cart === "object" && Object.keys(cart).length > 0) {
            for (let id in cart) {
                const item = cart[id];
                const qty = Number(item?.qty) || 0;
                const total = Number(item?.total) || 0;

                tq += qty;
                tp += total;
            }
        }

        setTotalQty(tq);
        setTotalPrice(tp);
    }, [cart]);

    const handleClearCart = () => {
        dispatch(clearCart());
    };

    const handleQtyChange = (id: string, qty: number) => {
        const product: ProductData = cart[id]?.product;
        const price = product.discountedPrice > 0 ? product.discountedPrice : product.price;
        const total = price * qty;

        dispatch(
            setCart({
                ...cart,
                [id]: {
                    ...cart[id],
                    qty,
                    price,
                    total,
                },
            })
        );
    };

    const handleRemove = (id: string) => {
        let temp: CartData = {};

        for (let i in cart) {
            if (id !== i) {
                temp = {
                    ...temp,
                    [i]: cart[i],
                };
            }
        }

        if (Object.keys(temp).length > 0) {
            dispatch(setCart(temp));
        } else {
            dispatch(clearCart());
        }
    };

    const handleCheckout = () => {
        setLoading(true);

        let data = [];
        for (let i in cart) {
            data.push({
                productId: i,
                qty: cart[i].qty,
            });
        }

        http
            .post("/checkout", { cart: data })
            .then(() => {
                dispatch(clearCart());
                navigate("/profile");
            })
            .catch(() => {})
            .finally(() => {
                setLoading(false);
            });
    };

    const handleDomiPay = async () => {
        if (!user || !user._id) {
            toast.error("Please log in to continue.");
            return;
        }

        const orderId = `ORD-${Date.now()}`;
        try {
            const response = await http.post("/payments/domi/create", {
                orderId,
                userId: user._id,
                amount: totalPrice,
            });

            const paymentData = await response.data;

            // Submit eSewa form per ePay v2
            const {esewa, orderNumber} = paymentData;

            if (esewa?.action && esewa?.fields) {
                try {
                    // Store order info in sessionStorage for potential use after redirect
                    sessionStorage.setItem('esewa_order', JSON.stringify({
                        orderId,
                        orderNumber,
                        transaction_uuid: esewa.fields.transaction_uuid,
                        total_amount: esewa.fields.total_amount
                    }));
                } catch (_) {
                    // ignore storage errors
                }

                // Build and submit a form to eSewa
                const form = document.createElement('form');
                form.method = esewa.method || 'POST';
                form.action = esewa.action;

                Object.entries(esewa.fields).forEach(([key, value]) => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = String(value);
                    form.appendChild(input);
                });

                document.body.appendChild(form);
                form.submit();
            } else {
                throw new Error('Invalid eSewa payment initialization response');
            }


        } catch (err) {
            console.error("DomiPay Error:", err);
            toast.error("Something went wrong while connecting to DomiPay.");
        }
    };

    return loading ? (
        <Loading />
    ) : (
        <>
            <div className="col-12">
                <div className="row">
                    <div className="col-12 mt-3 text-center text-uppercase">
                        <h2>Shopping Cart</h2>
                    </div>
                </div>

                <main className="row">
                    <div className="col-12 bg-white py-3 mb-3">
                        <div className="row">
                            <div className="col-lg-6 col-md-8 col-sm-10 mx-auto table-responsive">
                                {Object.keys(cart).length > 0 ? (
                                    <div className="row">
                                        <div className="col-12">
                                            <table className="table table-striped table-hover table-sm">
                                                <thead>
                                                <tr>
                                                    <th>Product</th>
                                                    <th>Price</th>
                                                    <th>Qty</th>
                                                    <th>Amount</th>
                                                    <th></th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {Object.keys(cart).map((id) => {
                                                    const item = cart[id];
                                                    const product = item?.product;

                                                    if (!product || !product.images) return null;

                                                    return (
                                                        <tr key={id}>
                                                            <td>
                                                                <img
                                                                    src={product.images[0] ? imgUrl(product.images[0]) : "/default.png"}
                                                                    className="img-fluid me-3"
                                                                    alt={product.name || "Product"}
                                                                />
                                                                {product.name}
                                                            </td>
                                                            <td>Rs. {item.price}</td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={item.qty}
                                                                    onChange={(e) => handleQtyChange(id, Number(e.target.value))}
                                                                />
                                                            </td>
                                                            <td>Rs. {item.total}</td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-link text-danger"
                                                                    onClick={() => handleRemove(id)}
                                                                >
                                                                    <i className="fas fa-times"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                </tbody>
                                                <tfoot>
                                                <tr>
                                                    <th colSpan={2} className="text-right">
                                                        Total
                                                    </th>
                                                    <th>{totalQty}</th>
                                                    <th>{totalPrice}</th>
                                                    <th></th>
                                                </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                        <div className="col-12 text-right">
                                            <button
                                                className="btn btn-outline-secondary me-3"
                                                type="button"
                                                onClick={handleClearCart}
                                            >
                                                Clear Cart
                                            </button>
                                            <button
                                                className="btn btn-outline-success me-3"
                                                onClick={handleCheckout}
                                            >
                                                Checkout
                                            </button>
                                            <button className="btn btn-primary" onClick={handleDomiPay}>
                                                Pay with Domi
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <h4 className="text-center">Cart is empty</h4>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};
