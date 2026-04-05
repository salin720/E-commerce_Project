import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { clearCart } from "@/store";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import http from "@/http";

type VerifyParams = { txn_id?: string; amt?: string; pid?: string }

const decodeEsewaData = (raw: string | null): Record<string, any> | null => {
    if (!raw) return null
    try {
        const normalized = raw.replace(/ /g, '+')
        const decoded = atob(normalized)
        return JSON.parse(decoded)
    } catch {
        return null
    }
}

export default function PaymentSuccess() {
    const [status, setStatus] = useState("Verifying your payment...");
    const [receipt, setReceipt] = useState<any>(null);
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const decoded = decodeEsewaData(searchParams.get("data"))
        const verifyParams: VerifyParams = {
            txn_id: searchParams.get("transaction_code") || searchParams.get("txn_id") || searchParams.get("transaction_uuid") || decoded?.transaction_code || decoded?.transaction_uuid || undefined,
            amt: searchParams.get("total_amount") || searchParams.get("amt") || decoded?.total_amount || undefined,
            pid: searchParams.get("transaction_uuid") || searchParams.get("pid") || decoded?.transaction_uuid || undefined,
        }

        if (!verifyParams.amt || !verifyParams.pid) {
            setStatus("Payment return received, but some verification details are missing.");
            return;
        }

        http.get(`/payments/domi/verify`, { params: verifyParams })
            .then(({ data }) => {
                if (data.success) {
                    const paidOrder = data.order || {}
                    const paidPayment = data.payment || {}
                    setStatus("Payment successful. Your order payment status has been updated to Paid.");
                    const pendingCart = JSON.parse(sessionStorage.getItem("pendingEsewaCart") || "{}");
                    const itemCount = Object.values(pendingCart).reduce((sum: number, item: any) => sum + Number(item?.qty || 0), 0);
                    setReceipt({
                        transactionId: paidPayment.transactionId || verifyParams.txn_id,
                        amount: paidPayment.amount || verifyParams.amt,
                        orderId: paidOrder._id || verifyParams.pid,
                        paidAt: paidPayment.paidAt ? new Date(paidPayment.paidAt).toLocaleString() : new Date().toLocaleString(),
                        method: paidOrder.paymentMethod || "eSewa",
                        paymentStatus: paidOrder.paymentStatus || "Paid",
                        itemCount,
                    });
                    dispatch(clearCart());
                    sessionStorage.removeItem("pendingEsewaCart");
                    sessionStorage.removeItem("pendingEsewaAmount");
                } else {
                    setStatus("Payment could not be verified. Please contact support if money was deducted.");
                }
            })
            .catch(() => setStatus("Error verifying payment. Please contact support if needed."));
    }, [searchParams, dispatch]);


    const orderCode = useMemo(() => receipt ? `#${String(receipt.orderId).slice(-8).toUpperCase()}` : "", [receipt]);

    return <div className="container py-5">
        <div className="bg-white rounded-4 shadow-sm p-4 p-lg-5 border-soft text-center">
            <h2 className="mb-2">eSewa Payment Result</h2>
            <p className="text-muted mb-0">{status}</p>
            {receipt && <div className="receipt-card text-start mx-auto mt-4" id="payment-receipt-card">
                <div className="receipt-header-row">
                    <div>
                        <div className="receipt-title">Quick Cart Payment Receipt</div>
                        <div className="small text-muted">Keep this receipt for your records.</div>
                    </div>
                    <span className="badge bg-success rounded-pill px-3 py-2">Paid</span>
                </div>
                <div className="receipt-divider"></div>
                <div className="receipt-grid">
                    <div className="receipt-box"><span>Order ID</span><strong>{orderCode}</strong></div>
                    <div className="receipt-box"><span>Transaction ID</span><strong>{receipt.transactionId}</strong></div>
                    <div className="receipt-box"><span>Payment Method</span><strong>{receipt.method}</strong></div>
                    <div className="receipt-box"><span>Total Amount</span><strong>Rs. {receipt.amount}</strong></div>
                    <div className="receipt-box"><span>Items</span><strong>{receipt.itemCount || 0}</strong></div>
                    <div className="receipt-box"><span>Paid At</span><strong>{receipt.paidAt}</strong></div>
                </div>
                <div className="receipt-note mt-3">Your payment is verified successfully. The order has been updated and will appear in your profile orders page.</div>
                <div className="receipt-actions">
                    <button className="btn btn-outline-dark rounded-pill px-4" onClick={() => window.print()}><i className="fa fa-print me-2"></i>Print receipt</button>
                    <Link to="/profile/orders" className="btn btn-dark rounded-pill px-4">Go to orders</Link>
                </div>
            </div>}
            <div className="d-flex justify-content-center gap-2 mt-4">
                <Link to="/profile/orders" className="btn btn-dark">Go to Orders</Link>
                <Link to="/" className="btn btn-outline-dark">Continue Shopping</Link>
            </div>
        </div>
    </div>
}
