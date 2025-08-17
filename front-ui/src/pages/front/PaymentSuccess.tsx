// src/pages/front/PaymentSuccess.tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function PaymentSuccess() {
    const [status, setStatus] = useState("Verifying...");
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const txnId = searchParams.get("txn_id");
        if (!txnId) {
            setStatus("❌ No transaction ID found.");
            return;
        }

        fetch(`/api/payments/domi/verify?txn_id=${txnId}`)
            .then((res) => res.json())
            .then((data) => {
                setStatus(data.success ? "✅ Payment Successful!" : "❌ Payment Failed.");
            })
            .catch(() => setStatus("❌ Error verifying payment."));
    }, []);

    return (
        <div className="container text-center mt-5">
            <h2>{status}</h2>
        </div>
    );
}
