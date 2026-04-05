import { CartData, ProductData } from "@/library/interfaces.ts";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { imgUrl } from "@/library/function.ts";
import { clearCart, setCart } from "@/store";
import { Loading } from "@/components";
import http from "@/http";
import { useNavigate } from "react-router-dom";

export const Cart: React.FC = () => {
    const cart: CartData = useSelector((state: any) => state.cart.value);

    const [totalQty, setTotalQty] = useState<number>(0);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [paymentMethod, setPaymentMethod] = useState<string>("cod");
    const [esewaLoading, setEsewaLoading] = useState<boolean>(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        let tq = 0;
        let tp = 0;

        if (cart && typeof cart === "object" && Object.keys(cart).length > 0) {
            for (const id in cart) {
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
        if (!window.confirm("Are you sure you want to clear your cart?")) return;
        dispatch(clearCart());
    };

    const handleQtyChange = (id: string, qty: number) => {
        if (qty < 1) return;

        const product: ProductData = cart[id]?.product;
        if (!product) return;

        const price =
            Number(product.discountedPrice) > 0
                ? Number(product.discountedPrice)
                : Number(product.price);

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
        if (!window.confirm("Are you sure you want to remove this item?")) return;

        const temp: CartData = {};

        for (const i in cart) {
            if (id !== i) {
                temp[i] = cart[i];
            }
        }

        if (Object.keys(temp).length > 0) {
            dispatch(setCart(temp));
        } else {
            dispatch(clearCart());
        }
    };

    const handleCheckout = () => {
        if (Object.keys(cart).length === 0) {
            alert("Cart is empty.");
            return;
        }

        setLoading(true);

        const data: any[] = [];
        for (const i in cart) {
            data.push({
                productId: i,
                qty: cart[i].qty,
                selectedSize: cart[i]?.selectedSize || "",
                selectedColor: cart[i]?.selectedColor || "",
            });
        }

        http
            .post("/checkout", { cart: data, paymentMethod: "COD" })
            .then(() => {
                dispatch(clearCart());
                navigate("/profile");
            })
            .catch((err) => {
                console.error("Checkout error:", err);
                alert("Checkout failed. Please try again.");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleEsewaCheckout = async () => {
        if (Object.keys(cart).length === 0) {
            alert("Cart is empty.");
            return;
        }

        setEsewaLoading(true);

        try {
            const data: any[] = [];

            for (const i in cart) {
                data.push({
                    productId: i,
                    qty: cart[i].qty,
                    selectedSize: cart[i]?.selectedSize || "",
                    selectedColor: cart[i]?.selectedColor || "",
                });
            }

            const res = await http.post("/payments/domi/create", { cart: data });

            sessionStorage.setItem("pendingEsewaCart", JSON.stringify(cart));
            sessionStorage.setItem("pendingEsewaAmount", String(totalPrice));

            const { esewa } = res.data;

            if (esewa && esewa.action && esewa.fields) {
                const form = document.createElement("form");
                form.method = esewa.method || "POST";
                form.action = esewa.action;

                Object.entries(esewa.fields).forEach(([key, value]) => {
                    const input = document.createElement("input");
                    input.type = "hidden";
                    input.name = key;
                    input.value = String(value);
                    form.appendChild(input);
                });

                document.body.appendChild(form);
                form.submit();
                document.body.removeChild(form);
            } else {
                alert("eSewa payment initialization failed.");
            }
        } catch (err) {
            console.error("eSewa error:", err);
            alert("Error connecting to eSewa.");
        } finally {
            setEsewaLoading(false);
        }
    };

    return loading ? (
        <Loading />
    ) : (
        <div className="col-12">
            <div className="row">
                <div className="col-12 mt-3 text-center text-uppercase">
                    <h2>Shopping Cart</h2>
                </div>
            </div>

            <main className="row">
                <div className="col-12 bg-white py-3 mb-3">
                    <div className="row">
                        <div className="col-lg-8 col-md-10 col-sm-12 mx-auto table-responsive">
                            {Object.keys(cart).length > 0 ? (
                                <div className="row">
                                    <div className="col-12">
                                        <table className="table table-striped table-hover align-middle">
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

                                                    if (!product) return null;

                                                    return (
                                                        <tr key={id}>
                                                            <td>
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <img
                                                                        src={
                                                                            product.images?.[0]
                                                                                ? imgUrl(product.images[0])
                                                                                : "/default.png"
                                                                        }
                                                                        alt={product.name || "Product"}
                                                                        style={{
                                                                            width: "70px",
                                                                            height: "70px",
                                                                            objectFit: "cover",
                                                                            borderRadius: "8px",
                                                                        }}
                                                                    />
                                                                    <div>
                                                                        <div className="fw-semibold">
                                                                            {product.name}
                                                                        </div>

                                                                        {item?.selectedSize ? (
                                                                            <small className="text-muted d-block">
                                                                                Size: {item.selectedSize}
                                                                            </small>
                                                                        ) : null}

                                                                        {item?.selectedColor ? (
                                                                            <small className="text-muted d-block">
                                                                                Color: {item.selectedColor}
                                                                            </small>
                                                                        ) : null}
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            <td>Rs. {item.price}</td>

                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={item.qty}
                                                                    className="form-control"
                                                                    style={{ width: "80px" }}
                                                                    onChange={(e) =>
                                                                        handleQtyChange(
                                                                            id,
                                                                            Number(e.target.value)
                                                                        )
                                                                    }
                                                                />
                                                            </td>

                                                            <td>Rs. {item.total}</td>

                                                            <td>
                                                                <button
                                                                    className="btn btn-link text-danger p-0"
                                                                    onClick={() => handleRemove(id)}
                                                                    title="Remove item"
                                                                    type="button"
                                                                >
                                                                    <i className="fas fa-trash"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>

                                            <tfoot>
                                                <tr>
                                                    <th colSpan={2} className="text-end">
                                                        Total
                                                    </th>
                                                    <th>{totalQty}</th>
                                                    <th>Rs. {totalPrice}</th>
                                                    <th></th>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>

                                    <div className="col-12 d-flex flex-wrap justify-content-end align-items-center gap-3 mt-3">
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            onClick={handleClearCart}
                                        >
                                            Clear Cart
                                        </button>

                                        <div className="d-flex flex-wrap align-items-center gap-3">
                                            <label className="mb-0">
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value="cod"
                                                    checked={paymentMethod === "cod"}
                                                    onChange={() => setPaymentMethod("cod")}
                                                />{" "}
                                                Cash on Delivery
                                            </label>

                                            <label className="mb-0">
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value="esewa"
                                                    checked={paymentMethod === "esewa"}
                                                    onChange={() => setPaymentMethod("esewa")}
                                                />{" "}
                                                Pay with eSewa
                                            </label>
                                        </div>

                                        {paymentMethod === "cod" ? (
                                            <button
                                                className="btn btn-outline-success"
                                                onClick={handleCheckout}
                                                disabled={Object.keys(cart).length === 0}
                                                type="button"
                                            >
                                                Checkout
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-success"
                                                onClick={handleEsewaCheckout}
                                                disabled={
                                                    esewaLoading || Object.keys(cart).length === 0
                                                }
                                                type="button"
                                            >
                                                {esewaLoading
                                                    ? "Redirecting..."
                                                    : "Pay with eSewa"}
                                            </button>
                                        )}
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
    );
};
