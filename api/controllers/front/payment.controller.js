const Payment = require("../../models/payment");
const Order = require("../../models/order.model");
const crypto = require("node:crypto");
const axios = require("axios");
const {Product, Detail} = require("@/models");
const {DataNotFound, ErrorMessage} = require("@/library/functions");
require("dotenv").config();

exports.createPayment = async (req, res, next) => {
    try {
        const {cart} = req.body
        let amount = 0;
        const order = await Order.create({userId: req.user._id, status: 'Processing', paymentMethod: 'eSewa', paymentStatus: 'Pending'})
        for (let item of cart) {
            const product = await Product.findById(item.productId)
            if (!product) return DataNotFound(next, `Product with ID ${item.productId} not found`)
            if ((product.stock || 0) < Number(item.qty || 0)) {
                return next({ status: 422, message: `${product.name} does not have enough stock.` })
            }
            const price = product.discountedPrice > 0 ? product.discountedPrice : product.price
            const total = price * item.qty;
            amount += total;
            await Detail.create({orderId: order._id, productId: product._id, qty: item.qty, price, total})
        }

        const success_url = process.env.CALLBACK_URL;
        const failure_url = process.env.CALLBACK_URL;
        const signed_field_names = 'total_amount,transaction_uuid,product_code';
        const signaturePayload = "total_amount=" + amount + ",transaction_uuid=" + order._id.toString() + ",product_code=EPAYTEST";
        const signature = crypto.createHmac('sha256', "8gBm/:&EnhH.1/q").update(signaturePayload).digest('base64');
        const action = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

        const payload = {
            orderId: order._id.toString(),
            esewa: {
                action,
                method: 'POST',
                fields: {
                    amount: amount.toString(),
                    total_amount: amount.toString(),
                    transaction_uuid: order._id.toString(),
                    product_code: "EPAYTEST",
                    product_service_charge: "0",
                    product_delivery_charge: "0",
                    tax_amount: "0",
                    success_url,
                    failure_url,
                    signed_field_names,
                    signature,
                },
            },
        };

        await Payment.findOneAndUpdate({ orderId: order._id.toString() }, { orderId: order._id.toString(), userId: req.user._id, amount, status: "Pending" }, { upsert: true, new: true });
        return res.json(payload);
    } catch (err) {
        console.error("Create Payment Error:", err.message);
        return res.status(500).json({error: "Payment initiation failed"});
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const {txn_id, amt, pid} = req.query;
        if (!txn_id || !amt || !pid) return res.status(400).json({success: false, error: "Missing required parameters."});
        const verificationUrl = "https://rc-epay.esewa.com.np/api/epay/transaction/status/";
        try {
            const response = await axios.get(verificationUrl, { params: { product_code: process.env.ESEWA_SCD || 'EPAYTEST', total_amount: amt, transaction_uuid: pid } });
            if (response.data.status === "COMPLETE") {
                const payment = await Payment.findOneAndUpdate({orderId: pid}, {status: "Paid", transactionId: txn_id, paidAt: new Date()}, {new: true});
                const order = await Order.findByIdAndUpdate(pid, { status: 'Confirmed', paymentStatus: 'Paid', paymentMethod: 'eSewa' }, { new: true })
                const details = await Detail.find({ orderId: pid })
                for (const detail of details) {
                    await Product.findByIdAndUpdate(detail.productId, { $inc: { stock: -Number(detail.qty || 0), totalSold: Number(detail.qty || 0) } })
                }
                return res.json({success: true, payment, order});
            } else {
                await Payment.findOneAndUpdate({orderId: pid}, {status: "Failed", transactionId: txn_id}, {new: true});
                await Order.findByIdAndUpdate(pid, { paymentStatus: 'Failed' })
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
