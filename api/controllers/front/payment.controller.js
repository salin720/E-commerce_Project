const Payment = require("../../models/payment");
const Order = require("../../models/order.model");
const crypto = require("node:crypto");
const axios = require("axios");
const {Product, Detail} = require("@/models");
const {DataNotFound, ErrorMessage} = require("@/library/functions");
require("dotenv").config();

exports.createPayment = async (req, res) => {
    try {
        const {cart} = req.body
        let amount = 0;
        const order = await Order.create({userId: req.user._id, status: 'Processing'})
        for (let item of cart) {
            const product = await Product.findById(item.productId)
            if (!product) {
                return DataNotFound(next, `Product with ID ${item.productId} not found`)
            }
            const price = product.discountedPrice > 0 ? product.discountedPrice : product.price
            const total = price * item.qty;
            amount += total; // Accumulate total amount
            await Detail.create({orderId: order._id, productId: product._id, qty: item.qty, price, total})
        }


        const success_url = process.env.CALLBACK_URL;
        const failure_url = process.env.CALLBACK_URL;

        // Signature
        const signed_field_names = 'total_amount,transaction_uuid,product_code';
        const signaturePayload = "total_amount=" + amount + ",transaction_uuid=" + order._id.toString() + ",product_code=EPAYTEST";

        const signature = crypto
            .createHmac('sha256', "8gBm/:&EnhH.1/q")
            .update(signaturePayload)
            .digest('base64');

        const baseUrl = 'https://rc-epay.esewa.com.np/api';
        const action = baseUrl + "/epay/main/v2/form";

        const payload = {
            orderId: order._id.toString(),
            esewa: {
                action,
                method: 'POST',
                fields: {
                    //   TODO - Add more fields as needed
                    amount: amount.toString(), // required by eSewa
                    total_amount: amount.toString(), // required by eSewa
                    transaction_uuid: order._id.toString(), // unique per transaction
                    product_code: "EPAYTEST", // set to orderId or your product code
                    product_service_charge: "0",
                    product_delivery_charge: "0",
                    tax_amount: "0",
                    success_url: success_url,
                    failure_url: failure_url,
                    signed_field_names,
                    signature,
                },
            },
        };

        console.log("Payload:", payload); // Log the payload

        try {
            // Create local payment record
            await Payment.create({
                orderId:order._id.toString(),
                userId: req.user._id,
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
        const {txn_id, amt, pid} = req.query;
        // txn_id = eSewa's reference id (rid), pid = our payment id/order id, amt = amount
        if (!txn_id || !amt || !pid) {
            return res.status(400).json({success: false, error: "Missing required parameters."});
        }
        // Call eSewa verification API
        const verificationUrl = "https://rc-epay.esewa.com.np/api/epay/transaction/status/";
        const scd = process.env.ESEWA_SCD || "EPAYTEST"; // merchant code
        try {
            const response = await axios.post(verificationUrl, {
                amt,
                rid: txn_id,
                pid,
                scd
            });
            // eSewa returns status: 'COMPLETE' for success
            if (response.data.status === "COMPLETE") {
                // Update local payment record
                const payment = await Payment.findOneAndUpdate(
                    {orderId: pid},
                    {status: "Paid", transactionId: txn_id, paidAt: new Date()},
                    {new: true}
                );
                // Create order if not exists
                if (payment && payment.userId) {
                    const existingOrder = await Order.findOne({
                        userId: payment.userId,
                        status: {$ne: "Cancelled"},
                        _id: pid
                    });
                    if (!existingOrder) {
                        await Order.create({userId: payment.userId, status: "Confirmed", _id: pid});
                    }
                }
                return res.json({success: true, payment});
            } else {
                // Mark as failed
                await Payment.findOneAndUpdate(
                    {orderId: pid},
                    {status: "Failed", transactionId: txn_id},
                    {new: true}
                );
                return res.json({success: false, error: response.data});
            }
        } catch (err) {
            console.error("eSewa Verification Error:", err.message);
            return res.status(500).json({success: false, error: "eSewa verification failed."});
        }
    } catch (err) {
        console.error("Verify Error:", err.message);
        res.status(500).json({success: false});
    }
};