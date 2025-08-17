const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    orderId: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    transactionId: String,
    amount: Number,
    status: {
        type: String,
        enum: ["Pending", "Paid", "Failed"],
        default: "Pending"
    },
    paidAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Payment", paymentSchema);
