import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { clearCart } from "@/store";
import { useSearchParams, Link } from "react-router-dom";
import http from "@/http";

export default function PaymentSuccess() {
    const [status, setStatus] = useState("Verifying your payment...");
    const [receipt, setReceipt] = useState<any>(null);
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();

    useEffect(() => {
        const txnId = searchParams.get("transaction_uuid") || searchParams.get("txn_id") || searchParams.get("refId") || searchParams.get("rid");
        const amt = searchParams.get("total_amount") || searchParams.get("amt");
        const pid = searchParams.get("transaction_uuid") || searchParams.get("pid");
        if (!txnId || !amt || !pid) {
            setStatus("Payment return received, but some verification details are missing.");
            return;
        }
        http.get(`/payments/domi/verify`, { params: { txn_id: txnId, amt, pid } })
            .then(({ data }) => {
                if (data.success) {
                    setStatus("Payment successful. Your order is now confirmed.");
                    setReceipt({ transactionId: txnId, amount: amt, orderId: data.order?._id || pid, paidAt: new Date().toLocaleString(), method: 'eSewa', paymentStatus: 'Paid' });
                    dispatch(clearCart());
                    sessionStorage.removeItem('pendingEsewaCart');
                } else {
                    setStatus("Payment could not be verified. Please contact support if money was deducted.");
                }
            })
            .catch(() => setStatus("Error verifying payment. Please contact support if needed."));
    }, [searchParams]);

    return <div className="container py-5 text-center">
        <div className="bg-white rounded-4 shadow-sm p-5 border-soft">
            <h2 className="mb-3">eSewa Payment Result</h2>
            <p className="text-muted">{status}</p>
            {receipt && <div className="receipt-card text-start mx-auto mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3"><strong>Transaction Receipt</strong><span className="badge bg-success">Paid</span></div>
                <div className="receipt-row"><span>Order</span><span>#{String(receipt.orderId).slice(-8).toUpperCase()}</span></div>
                <div className="receipt-row"><span>Transaction</span><span>{receipt.transactionId}</span></div>
                <div className="receipt-row"><span>Amount</span><span>Rs. {receipt.amount}</span></div>
                <div className="receipt-row"><span>Method</span><span>{receipt.method}</span></div>
                <div className="receipt-row"><span>Paid At</span><span>{receipt.paidAt}</span></div>
            </div>}
            <div className="d-flex justify-content-center gap-2 mt-4">
                <Link to="/profile" className="btn btn-dark">Go to Orders</Link>
                <Link to="/" className="btn btn-outline-dark">Continue Shopping</Link>
            </div>
        </div>
    </div>
}
