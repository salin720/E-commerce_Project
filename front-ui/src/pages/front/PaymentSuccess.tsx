import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import http from "@/http";

export default function PaymentSuccess() {
    const [status, setStatus] = useState("Verifying your payment...");
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const txnId = searchParams.get("transaction_uuid") || searchParams.get("txn_id") || searchParams.get("refId") || searchParams.get("rid");
        const amt = searchParams.get("total_amount") || searchParams.get("amt");
        const pid = searchParams.get("transaction_uuid") || searchParams.get("pid");
        if (!txnId || !amt || !pid) {
            setStatus("Payment return received, but some verification details are missing.");
            return;
        }
        http.get(`/payments/domi/verify`, { params: { txn_id: txnId, amt, pid } })
            .then(({ data }) => setStatus(data.success ? "Payment successful. Your order is now confirmed." : "Payment could not be verified. Please contact support if money was deducted."))
            .catch(() => setStatus("Error verifying payment. Please contact support if needed."));
    }, [searchParams]);

    return <div className="container py-5 text-center">
        <div className="bg-white rounded-4 shadow-sm p-5 border-soft">
            <h2 className="mb-3">eSewa Payment Result</h2>
            <p className="text-muted">{status}</p>
            <div className="d-flex justify-content-center gap-2 mt-4">
                <Link to="/profile" className="btn btn-dark">Go to Orders</Link>
                <Link to="/" className="btn btn-outline-dark">Continue Shopping</Link>
            </div>
        </div>
    </div>
}
