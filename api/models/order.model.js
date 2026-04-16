const {Schema, model} = require ('mongoose')
const {modelConfig} = require('../library/constants')

const Order = model('Order', new Schema({
    userId: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
    status: {type: String, enum: ['Processing', 'Confirmed', 'Packed', 'Shipping', 'Delivered', 'Cancelled'], default: 'Processing'},
    paymentMethod: { type: String, enum: ['COD', 'eSewa'], default: 'COD' },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
    trackingCode: { type: String, default: '' },
    adminNote: { type: String, default: '' },
    customerAddress: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
}, modelConfig))

module.exports = Order
