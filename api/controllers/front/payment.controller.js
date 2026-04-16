const Payment = require("../../models/payment");
const Order = require("../../models/order.model");
const crypto = require("node:crypto");
const axios = require("axios");
const { Product, Detail, User } = require("@/models");
const { DataNotFound } = require("@/library/functions");
require("dotenv").config();

const buildCallbackUrl = (baseUrl = '', fallbackPath = '/payment/success') => {
    if (!baseUrl) return fallbackPath;
    try {
        const parsed = new URL(baseUrl);
        if (!parsed.pathname || parsed.pathname === '/' || !parsed.pathname.includes('payment')) parsed.pathname = fallbackPath;
        return parsed.toString();
    } catch {
        return baseUrl.includes('payment') ? baseUrl : `${baseUrl.replace(/\/$/, '')}${fallbackPath}`;
    }
};

exports.createPayment = async (req, res, next) => {
    try {
        const { cart, customerAddress = '', customerPhone = '' } = req.body;
        if (!String(customerAddress).trim() || !String(customerPhone).trim()) return res.status(422).json({ error: 'Delivery address and phone number are required.' });
        let amount = 0;
        const order = await Order.create({
            userId: req.user._id,
            status: 'Processing',
            paymentMethod: 'eSewa',
            paymentStatus: 'Pending',
            customerAddress: String(customerAddress).trim(),
            customerPhone: String(customerPhone).trim()
        });
        for (const item of cart) {
            const product = await Product.findById(item.productId);
            if (!product) return DataNotFound(next, `Product with ID ${item.productId} not found`);
            if ((product.stock || 0) < Number(item.qty || 0)) return next({ status: 422, message: `${product.name} does not have enough stock.` });
            const price = product.discountedPrice > 0 ? product.discountedPrice : product.price;
            const total = price * item.qty;
            amount += total;
            await Detail.create({ orderId: order._id, productId: product._id, qty: item.qty, price, total, selectedSize: item.selectedSize || '', selectedColor: item.selectedColor || '' });
        }

        const success_url = buildCallbackUrl(process.env.CALLBACK_URL, '/payment/success');
        const failure_url = buildCallbackUrl(process.env.CALLBACK_URL, '/payment/success');
        const signed_field_names = 'total_amount,transaction_uuid,product_code';
        const signaturePayload = `total_amount=${amount},transaction_uuid=${order._id.toString()},product_code=EPAYTEST`;
        const signature = crypto.createHmac('sha256', process.env.ESEWA_SECRET || "8gBm/:&EnhH.1/q").update(signaturePayload).digest('base64');

        await Payment.findOneAndUpdate({ orderId: order._id.toString() }, { orderId: order._id.toString(), userId: req.user._id, amount, status: 'Pending' }, { upsert: true, new: true });

        return res.json({
            orderId: order._id.toString(),
            esewa: {
                action: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
                method: 'POST',
                fields: {
                    amount: amount.toString(),
                    total_amount: amount.toString(),
                    transaction_uuid: order._id.toString(),
                    product_code: process.env.ESEWA_SCD || 'EPAYTEST',
                    product_service_charge: '0',
                    product_delivery_charge: '0',
                    tax_amount: '0',
                    success_url,
                    failure_url,
                    signed_field_names,
                    signature,
                },
            },
        });
    } catch (err) {
        console.error('Create Payment Error:', err.message);
        return res.status(500).json({ error: 'Payment initiation failed' });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const txnId = req.query.txn_id || req.query.transaction_code || req.query.reference_id || '';
        const amt = req.query.amt || req.query.total_amount;
        const pid = req.query.pid || req.query.transaction_uuid || req.query.orderId;
        if (!amt || !pid) return res.status(400).json({ success: false, error: 'Missing required parameters.' });

        const response = await axios.get('https://rc-epay.esewa.com.np/api/epay/transaction/status/', { params: { product_code: process.env.ESEWA_SCD || 'EPAYTEST', total_amount: amt, transaction_uuid: pid } });

        if (response.data.status === 'COMPLETE') {
            const payment = await Payment.findOneAndUpdate({ orderId: pid }, { status: 'Paid', transactionId: txnId || response.data.transaction_code || pid, paidAt: new Date(), amount: Number(amt) }, { new: true, upsert: true });
            const order = await Order.findByIdAndUpdate(pid, { paymentStatus: 'Paid', paymentMethod: 'eSewa' }, { new: true });
            const details = await Detail.find({ orderId: pid });
            for (const detail of details) {
                await Product.findByIdAndUpdate(detail.productId, { $inc: { stock: -Number(detail.qty || 0), totalSold: Number(detail.qty || 0) } });
            }
            const user = order?.userId ? await User.findById(order.userId).lean() : null;
            return res.json({ success: true, payment, order, user, detailsCount: details.length });
        }

        await Payment.findOneAndUpdate({ orderId: pid }, { status: 'Failed', transactionId: txnId || pid }, { new: true, upsert: true });
        await Order.findByIdAndUpdate(pid, { paymentStatus: 'Failed' });
        return res.json({ success: false, error: response.data });
    } catch (err) {
        console.error('eSewa Verification Error:', err.message);
        return res.status(500).json({ success: false, error: 'eSewa verification failed.' });
    }
};
