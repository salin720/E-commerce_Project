// src/pages/front/PaymentSuccess.tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function PaymentSuccess() {
    const [status, setStatus] = useState("Verifying...");
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // eSewa returns: ?amt=1000&pid=ECOM-...&refId=... (or txn_id/rid)
        const txnId = searchParams.get("txn_id") || searchParams.get("refId") || searchParams.get("rid");
        const amt = searchParams.get("amt");
        const pid = searchParams.get("pid");
        if (!txnId || !amt || !pid) {
            setStatus("❌ Missing payment details in URL.");
            return;
        }
        fetch(`/api/payments/domi/verify?txn_id=${txnId}&amt=${amt}&pid=${pid}`)
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
