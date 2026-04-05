import { CartData, ProductData } from "@/library/interfaces.ts";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import { imgUrl } from "@/library/function.ts";
import { getPriceStability, getSmartPurchaseScore } from "@/library/productInsights.ts";
import { clearCart, setCart } from "@/store";
import { Loading } from "@/components";
import http from "@/http";
import { useNavigate } from "react-router-dom";

type OptimizationSuggestion = {
    currentId: string;
    currentProduct: ProductData;
    alternatives: ProductData[];
};

const getEffectivePrice = (product: ProductData) =>
    Number(product?.discountedPrice) > 0 ? Number(product.discountedPrice) : Number(product?.price || 0);

const formatList = (items?: string[]) => (items && items.length > 0 ? items.join(", ") : "—");
const getCategoryKey = (product?: ProductData | null) => String(product?.categoryId || product?.category?._id || product?.category?.name || "");

const getNumericSpecValue = (label: string, product: ProductData) => {
    switch (label) {
        case "Selling price":
            return getEffectivePrice(product);
        case "Original price":
            return Number(product.price || 0);
        case "Discount":
            return product.price > 0 && getEffectivePrice(product) < product.price
                ? Math.round(((product.price - getEffectivePrice(product)) / product.price) * 100)
                : 0;
        case "Smart score":
            return getSmartPurchaseScore(product).score;
        case "User rating":
            return Number(product.avgRating || 0);
        case "Views":
            return Number(product.totalViews || 0);
        case "Sales volume":
            return Number(product.totalSold || 0);
        case "Stock":
            return Number(product.stock || 0);
        case "Price scale": {
            const stability = getPriceStability(product);
            return stability.tone === "down" ? stability.differencePercent : stability.tone === "up" ? -stability.differencePercent : 0;
        }
        default:
            return null;
    }
};

const getCellTone = (label: string, product: ProductData, comparedProducts: ProductData[]) => {
    const value = getNumericSpecValue(label, product);
    if (value === null) return "neutral";

    const values = comparedProducts
        .map((item) => getNumericSpecValue(label, item))
        .filter((item): item is number => item !== null);

    if (values.length < 2) return "neutral";

    const unique = Array.from(new Set(values));
    if (unique.length === 1) return "neutral";

    const lowerIsBetter = ["Selling price", "Original price"].includes(label);
    const higherIsBetter = ["Discount", "Smart score", "User rating", "Views", "Sales volume", "Stock", "Price scale"].includes(label);
    if (!lowerIsBetter && !higherIsBetter) return "neutral";

    const best = lowerIsBetter ? Math.min(...values) : Math.max(...values);
    const worst = lowerIsBetter ? Math.max(...values) : Math.min(...values);

    if (value === best && value !== worst) return "best";
    if (value === worst && value !== best) return "worst";
    return "neutral";
};

export const Cart: React.FC = () => {
    const cart: CartData = useSelector((state: any) => state.cart.value);

    const [totalQty, setTotalQty] = useState<number>(0);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [paymentMethod, setPaymentMethod] = useState<string>("cod");
    const [esewaLoading, setEsewaLoading] = useState<boolean>(false);
    const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
    const [suggestionLoading, setSuggestionLoading] = useState<boolean>(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        let tq = 0;
        let tp = 0;
        Object.keys(cart || {}).forEach((id) => {
            tq += Number(cart[id]?.qty) || 0;
            tp += Number(cart[id]?.total) || 0;
        });
        setTotalQty(tq);
        setTotalPrice(tp);
    }, [cart]);

    useEffect(() => {
        const productIds = Object.keys(cart || {});
        if (productIds.length === 0) {
            setSuggestions([]);
            return;
        }

        let isCancelled = false;

        const loadSuggestions = async () => {
            try {
                setSuggestionLoading(true);
                const responses = await Promise.all(
                    productIds.map(async (id) => {
                        try {
                            const currentProduct = cart[id]?.product;
                            if (!currentProduct) return null;
                            const response = await http.get(`/products/${id}/similar?limit=20`);
                            const similarProducts: ProductData[] = response.data?.similar || response.data?.products || [];
                            const currentPrice = getEffectivePrice(currentProduct);
                            const currentScore = getSmartPurchaseScore(currentProduct).score;
                            const currentCategoryKey = getCategoryKey(currentProduct);

                            const alternatives = similarProducts
                                .filter((item) => item?._id && item._id !== currentProduct._id)
                                .filter((item) => getCategoryKey(item) === currentCategoryKey)
                                .map((item) => ({
                                    ...item,
                                    _effectivePrice: getEffectivePrice(item),
                                    _score: getSmartPurchaseScore(item).score,
                                } as ProductData & { _effectivePrice: number; _score: number }))
                                .filter((item) => item._effectivePrice > 0)
                                .sort((a, b) => {
                                    const aSavings = currentPrice - a._effectivePrice;
                                    const bSavings = currentPrice - b._effectivePrice;
                                    const aScoreLead = a._score - currentScore;
                                    const bScoreLead = b._score - currentScore;
                                    if (aSavings !== bSavings) return bSavings - aSavings;
                                    return bScoreLead - aScoreLead;
                                })
                                .filter((item, index, arr) => arr.findIndex((p) => p._id === item._id) === index)
                                .slice(0, 3)
                                .map(({ _effectivePrice, _score, ...rest }) => rest as ProductData);

                            if (alternatives.length === 0) return null;
                            return { currentId: id, currentProduct, alternatives } satisfies OptimizationSuggestion;
                        } catch (error) {
                            console.error("Suggestion load failed for cart item", id, error);
                            return null;
                        }
                    })
                );
                if (!isCancelled) setSuggestions(responses.filter(Boolean) as OptimizationSuggestion[]);
            } finally {
                if (!isCancelled) setSuggestionLoading(false);
            }
        };

        loadSuggestions();
        return () => { isCancelled = true; };
    }, [cart]);

    const totalPotentialSavings = useMemo(
        () => suggestions.reduce((sum, item) => {
            const currentPrice = getEffectivePrice(item.currentProduct);
            const bestAlternativePrice = Math.min(...item.alternatives.map((alt) => getEffectivePrice(alt)));
            const savings = Math.max(0, currentPrice - bestAlternativePrice);
            return sum + savings * (cart[item.currentId]?.qty || 1);
        }, 0),
        [suggestions, cart]
    );

    const handleClearCart = () => {
        if (!window.confirm("Are you sure you want to clear your cart?")) return;
        dispatch(clearCart());
    };

    const handleQtyChange = (id: string, qty: number) => {
        if (qty < 1) return;
        const product: ProductData = cart[id]?.product;
        if (!product) return;
        const price = getEffectivePrice(product);
        dispatch(setCart({
            ...cart,
            [id]: { ...cart[id], qty, price, total: price * qty },
        }));
    };

    const handleRemove = (id: string) => {
        if (!window.confirm("Are you sure you want to remove this item?")) return;
        const temp: CartData = {};
        for (const i in cart) if (id !== i) temp[i] = cart[i];
        if (Object.keys(temp).length > 0) dispatch(setCart(temp));
        else dispatch(clearCart());
    };

    const handleReplaceItem = (currentId: string, suggestedProduct: ProductData) => {
        const existing = cart[currentId];
        if (!existing) return;
        const nextCart: CartData = { ...cart };
        delete nextCart[currentId];
        const qty = Number(existing.qty) || 1;
        const price = getEffectivePrice(suggestedProduct);
        nextCart[suggestedProduct._id] = {
            product: suggestedProduct,
            qty,
            price,
            total: price * qty,
            selectedSize: existing.selectedSize && suggestedProduct.sizes?.includes(existing.selectedSize) ? existing.selectedSize : "",
            selectedColor: existing.selectedColor && suggestedProduct.colors?.includes(existing.selectedColor) ? existing.selectedColor : "",
        };
        dispatch(setCart(nextCart));
    };

    const buildPayload = () => Object.keys(cart).map((id) => ({
        productId: id,
        qty: cart[id].qty,
        selectedSize: cart[id]?.selectedSize || "",
        selectedColor: cart[id]?.selectedColor || "",
    }));

    const handleCheckout = () => {
        if (Object.keys(cart).length === 0) return alert("Cart is empty.");
        setLoading(true);
        http.post("/checkout", { cart: buildPayload(), paymentMethod: "COD" })
            .then(() => {
                dispatch(clearCart());
                navigate("/profile");
            })
            .catch(() => alert("Checkout failed. Please try again."))
            .finally(() => setLoading(false));
    };

    const handleEsewaCheckout = async () => {
        if (Object.keys(cart).length === 0) return alert("Cart is empty.");
        setEsewaLoading(true);
        try {
            const res = await http.post("/payments/domi/create", { cart: buildPayload() });
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

    const summaryBadge = paymentMethod === "esewa" ? "Secure eSewa payment" : "Cash on delivery available";

    return loading ? <Loading /> : (
        <div className="col-12">
            <div className="cart-page-wrap px-2 px-lg-3 py-3">
                <div className="text-center text-uppercase mb-3"><h2 className="mb-0">Shopping Cart</h2></div>
                {Object.keys(cart).length > 0 ? (
                    <>
                        <div className="row g-4 align-items-start">
                            <div className="col-xl-8 col-lg-7">
                                <div className="cart-table-card bg-white p-3 p-lg-4 rounded-4 border-soft shadow-sm h-100">
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0 cart-items-table">
                                            <thead>
                                                <tr>
                                                    <th>Product</th>
                                                    <th className="text-nowrap">Price</th>
                                                    <th>Qty</th>
                                                    <th className="text-nowrap">Amount</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.keys(cart).map((id) => {
                                                    const item = cart[id];
                                                    const product = item?.product;
                                                    if (!product) return null;
                                                    const score = getSmartPurchaseScore(product).score;
                                                    const stability = getPriceStability(product);
                                                    return (
                                                        <tr key={id}>
                                                            <td>
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <img src={product.images?.[0] ? imgUrl(product.images[0]) : "/default.png"} alt={product.name || "Product"} className="cart-item-thumb" />
                                                                    <div className="cart-item-meta">
                                                                        <div className="fw-semibold fs-5 mb-1">{product.name}</div>
                                                                        <div className="small text-muted d-flex flex-wrap gap-2 align-items-center mb-1">
                                                                            <span>{product.totalSold || 0} sold</span>
                                                                            <span>•</span>
                                                                            <span>{product.totalViews || 0} views</span>
                                                                        </div>
                                                                        <div className="product-insights-row product-insights-inline product-insights-inline-cart mb-1">
                                                                            <span className="insight-chip insight-score">Score: {score}/100</span>
                                                                            <span className={`insight-chip insight-${stability.tone}`}>
                                                                                <i className={`fas ${stability.tone === "up" ? "fa-arrow-trend-up" : stability.tone === "down" ? "fa-arrow-trend-down" : "fa-wave-square"} me-2`}></i>
                                                                                {stability.text}
                                                                            </span>
                                                                        </div>
                                                                        {item?.selectedSize ? <small className="text-muted d-block">Size: {item.selectedSize}</small> : null}
                                                                        {item?.selectedColor ? <small className="text-muted d-block">Color: {item.selectedColor}</small> : null}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="fw-semibold text-nowrap">Rs. {item.price}</td>
                                                            <td>
                                                                <input type="number" min="1" value={item.qty} className="form-control cart-qty-input" onChange={(e) => handleQtyChange(id, Number(e.target.value))} />
                                                            </td>
                                                            <td className="fw-semibold text-nowrap">Rs. {item.total}</td>
                                                            <td>
                                                                <button className="btn btn-link text-danger p-0" onClick={() => handleRemove(id)} title="Remove item" type="button"><i className="fas fa-trash"></i></button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-4 col-lg-5">
                                <div className="cart-summary-card bg-white p-3 p-lg-4 rounded-4 border-soft shadow-sm sticky-lg-top">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h4 className="mb-0">Order summary</h4>
                                        <span className="badge rounded-pill text-bg-dark">{summaryBadge}</span>
                                    </div>
                                    <div className="summary-row"><span>Subtotal</span><strong>Rs. {totalPrice}</strong></div>
                                    <div className="summary-row"><span>Total items</span><strong>{totalQty}</strong></div>
                                    <div className="summary-row"><span>Potential savings</span><strong className="text-success">Rs. {totalPotentialSavings}</strong></div>
                                    <div className="summary-divider"></div>
                                    <div className="mb-3">
                                        <div className="fw-semibold mb-2">Payment method</div>
                                        <div className="payment-method-options">
                                            <label className={`payment-option ${paymentMethod === "cod" ? "active" : ""}`}>
                                                <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
                                                <span><i className="fa-solid fa-money-bill-wave me-2"></i>Cash on Delivery</span>
                                            </label>
                                            <label className={`payment-option ${paymentMethod === "esewa" ? "active" : ""}`}>
                                                <input type="radio" name="paymentMethod" value="esewa" checked={paymentMethod === "esewa"} onChange={() => setPaymentMethod("esewa")} />
                                                <span><i className="fa-solid fa-wallet me-2"></i>Pay with eSewa</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="d-grid gap-2">
                                        {paymentMethod === "cod" ? (
                                            <button className="btn btn-dark btn-lg rounded-pill" onClick={handleCheckout} disabled={Object.keys(cart).length === 0} type="button">Place order</button>
                                        ) : (
                                            <button className="btn btn-success btn-lg rounded-pill" onClick={handleEsewaCheckout} disabled={esewaLoading || Object.keys(cart).length === 0} type="button">{esewaLoading ? "Redirecting..." : "Pay with eSewa"}</button>
                                        )}
                                        <button className="btn btn-outline-secondary rounded-pill" type="button" onClick={handleClearCart}>Clear cart</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {suggestions.length > 0 ? (
                            <div className="cart-compare-shell p-3 p-md-4 mt-4">
                                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
                                    <div>
                                        <h4 className="mb-1">Cart optimization suggestions</h4>
                                        <p className="text-muted mb-0">Same-category comparison only, arranged to show up to four products clearly on one page.</p>
                                    </div>
                                    <span className="cart-compare-savings">Potential savings: Rs. {totalPotentialSavings}</span>
                                </div>

                                <div className="d-flex flex-column gap-4">
                                    {suggestions.map((suggestion) => {
                                        const comparedProducts = [suggestion.currentProduct, ...suggestion.alternatives].slice(0, 4);
                                        const qty = cart[suggestion.currentId]?.qty || 1;
                                        const bestAlternative = suggestion.alternatives.reduce((best, alt) => {
                                            const bestSavings = Math.max(0, getEffectivePrice(suggestion.currentProduct) - getEffectivePrice(best));
                                            const altSavings = Math.max(0, getEffectivePrice(suggestion.currentProduct) - getEffectivePrice(alt));
                                            return altSavings > bestSavings ? alt : best;
                                        }, suggestion.alternatives[0]);
                                        const bestSavings = Math.max(0, getEffectivePrice(suggestion.currentProduct) - getEffectivePrice(bestAlternative)) * qty;

                                        const specRows = [
                                            { label: "Brand", value: (product: ProductData) => product.brand?.name || "—" },
                                            { label: "Category", value: (product: ProductData) => product.category?.name || "—" },
                                            { label: "Selling price", value: (product: ProductData) => `Rs. ${getEffectivePrice(product)}` },
                                            { label: "Original price", value: (product: ProductData) => `Rs. ${product.price || 0}` },
                                            { label: "Discount", value: (product: ProductData) => `${product.price > 0 && getEffectivePrice(product) < product.price ? Math.round(((product.price - getEffectivePrice(product)) / product.price) * 100) : 0}%` },
                                            { label: "Smart score", value: (product: ProductData) => `${getSmartPurchaseScore(product).score}/100` },
                                            { label: "Price scale", value: (product: ProductData) => getPriceStability(product).text },
                                            { label: "User rating", value: (product: ProductData) => `${Number(product.avgRating || 0).toFixed(1)} / 5 (${Number(product.reviewCount || 0)})` },
                                            { label: "Views", value: (product: ProductData) => String(product.totalViews || 0) },
                                            { label: "Sales volume", value: (product: ProductData) => String(product.totalSold || 0) },
                                            { label: "Sizes", value: (product: ProductData) => formatList(product.sizes) },
                                            { label: "Colors", value: (product: ProductData) => formatList(product.colors) },
                                            { label: "Stock", value: (product: ProductData) => String(product.stock ?? "—") },
                                            { label: "Key features", value: (product: ProductData) => product.shortDescription || product.description || "—" },
                                        ];

                                        return (
                                            <div key={`${suggestion.currentId}-${suggestion.currentProduct._id}`} className="cart-compare-card">
                                                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
                                                    <div>
                                                        <div className="fw-semibold fs-5">Same-category comparison for {suggestion.currentProduct.name}</div>
                                                        <div className="text-muted">Compare value, price, ratings, and stock side by side before replacing the item.</div>
                                                    </div>
                                                    <span className="cart-compare-savings">Best line savings: Rs. {bestSavings}</span>
                                                </div>

                                                <div className="table-responsive compare-table-wrap">
                                                    <table className="table cart-compare-table align-middle mb-0">
                                                        <thead>
                                                            <tr>
                                                                <th className="spec-col">Specification</th>
                                                                {comparedProducts.map((product, index) => {
                                                                    const isCurrent = index === 0;
                                                                    const score = getSmartPurchaseScore(product).score;
                                                                    const stability = getPriceStability(product);
                                                                    return (
                                                                        <th key={product._id} className={isCurrent ? "compare-col compare-current" : "compare-col"}>
                                                                            <div className="compare-head-card">
                                                                                <img src={product.images?.[0] ? imgUrl(product.images[0]) : "/default.png"} alt={product.name} className="compare-head-image" />
                                                                                <div className="compare-head-title">{product.name}</div>
                                                                                <div className="compare-head-meta">{product.brand?.name || "Quick Cart"}</div>
                                                                                <div className="compare-head-pills">
                                                                                    <span className="insight-chip insight-score">{score}/100</span>
                                                                                    <span className={`insight-chip insight-${stability.tone}`}><i className={`fas ${stability.tone === "up" ? "fa-arrow-trend-up" : stability.tone === "down" ? "fa-arrow-trend-down" : "fa-wave-square"} me-2`}></i>{stability.text}</span>
                                                                                </div>
                                                                                {isCurrent ? <span className="compare-current-badge">Current in cart</span> : <button className="btn btn-dark btn-sm rounded-pill px-3" type="button" onClick={() => handleReplaceItem(suggestion.currentId, product)}>Replace with this</button>}
                                                                            </div>
                                                                        </th>
                                                                    );
                                                                })}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {specRows.map((row) => (
                                                                <tr key={row.label}>
                                                                    <th className="spec-row-title">{row.label}</th>
                                                                    {comparedProducts.map((product, index) => (
                                                                        <td key={`${product._id}-${row.label}`} className={`${index === 0 ? "compare-value compare-current-cell" : "compare-value"} compare-tone-${getCellTone(row.label, product, comparedProducts)}`}>{row.value(product)}</td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : suggestionLoading ? <div className="mt-4 text-muted">Checking same-category optimized alternatives for your cart...</div> : null}
                    </>
                ) : (
                    <div className="bg-white rounded-4 border-soft shadow-sm py-5 text-center"><h4 className="mb-0">Cart is empty</h4></div>
                )}
            </div>
        </div>
    );
};
