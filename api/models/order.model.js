const {Schema, model} = require ('mongoose')
const {modelConfig} = require('../library/constants')

const Order = model('Order', new Schema({
    userId: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
    status: {type: String, enum: ['Processing', 'Confirmed', 'Shipping', 'Delivered', 'Cancelled'], default: 'Processing'}
}, modelConfig))

module.exports = Order