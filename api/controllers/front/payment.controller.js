const Payment = require("../../models/payment");
const crypto = require("node:crypto");
require("dotenv").config();

exports.createPayment = async (req, res) => {
    try {
        const {amount, orderId, userId} = req.body;

        const success_url = process.env.CALLBACK_URL;
        const failure_url = process.env.CALLBACK_URL;

        // Signature
        const signed_field_names = 'total_amount';
        const signaturePayload = "total_amount=" + amount;

        const signature = crypto
            .createHmac('sha256', "8gBm/:&EnhH.1/q")
            .update(signaturePayload)
            .digest('base64');

        const baseUrl = 'https://rc-epay.esewa.com.np/api';
        const action = baseUrl + "/epay/main/v2/form";

        const payload = {
            orderId: orderId,
            esewa: {
                action,
                method: 'POST',
                fields: {
                    amount: amount.toString(),
                    total_amount: amount.toString(),
                    success_url,
                    failure_url,
                    signed_field_names,
                    signature,
                },
            },
        };

        console.log("Payload:", payload); // Log the payload

        try {
            // Create local payment record
            await Payment.create({
                orderId,
                userId,
                amount,
                status: "Pending"
            });

            return res.json(payload);
        } catch (axiosErr) {
            console.error("Axios Error:", axiosErr.message, axiosErr.response ? axiosErr.response.data : axiosErr.message);
            return res.status(500).json({error: "Payment initiation failed", details: axiosErr.message});
        }
    } catch (err) {
        console.error("Create Payment Error:", err.message);
        res.status(500).json({error: "Payment initiation failed"});
    }
};


exports.verifyPayment = async (req, res) => {
    try {
        const {txn_id} = req.query;

        const payment = await Payment.findOne({transactionId: txn_id});

        if (payment && payment.status === "Paid") {
            return res.json({success: true});
        }

        return res.json({success: false});
    } catch (err) {
        console.error("Verify Error:", err.message);
        res.status(500).json({success: false});
    }
};