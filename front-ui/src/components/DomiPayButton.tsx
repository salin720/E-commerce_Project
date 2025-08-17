// // src/components/DomiPayButton.tsx
// import React from "react";
//
// interface DomiPayButtonProps {
//     orderId: string;
//     userId: string;
//     amount: number;
// }
//
// export const DomiPayButton: React.FC<DomiPayButtonProps> = ({ orderId, userId, amount }) => {
//     const handlePayment = async () => {
//         try {
//             const res = await fetch("/api/payments/domi/create", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ orderId, userId, amount }),
//             });
//
//             const data = await res.json();
//             if (data.paymentUrl) {
//                 window.location.href = data.paymentUrl;
//             } else {
//                 alert("Failed to get payment URL");
//             }
//         } catch (err) {
//             console.error(err);
//             alert("Something went wrong");
//         }
//     };
//
//     return <button onClick={handlePayment} className="btn btn-primary">Pay with Domi</button>;
// };

// src/components/DomiPayButton.tsx
import React from "react";

interface DomiPayButtonProps {
    orderId: string;
    userId: string;
    amount: number;
}

export const DomiPayButton: React.FC<DomiPayButtonProps> = ({ orderId, userId, amount }) => {
    const handlePayment = async () => {
        try {
            const res = await fetch("/api/payments/domi/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, userId, amount }),
            });

            const data = await res.json();
            if (data.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else {
                alert("Failed to get payment URL");
            }
        } catch (err) {
            console.error("Fetch error:", err); // More detailed error logging
            alert("Something went wrong");
        }
    };

    return <button onClick={handlePayment} className="btn btn-primary">Pay with Domi</button>;
};
