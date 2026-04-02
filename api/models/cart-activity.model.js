const {Schema, model} = require('mongoose')
const {modelConfig} = require('../library/constants')

const CartActivity = model('CartActivity', new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    productId: {type: Schema.Types.ObjectId, ref: 'Product', required: true},
    action: {type: String, enum: ['add', 'remove'], required: true},
    qty: {type: Number, default: 1},
    source: {type: String, default: 'cart'},
}, modelConfig))

module.exports = CartActivity
