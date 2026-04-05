const {Schema, model} = require ('mongoose')
const {modelConfig, numberRequired} = require('../library/constants')

const Detail = model('Detail', new Schema({
    orderId: {type: Schema.Types.ObjectId, required: true, ref: 'Order'},
    productId: {type: Schema.Types.ObjectId, required: true, ref: 'Product'},
    qty: numberRequired,
    price: numberRequired,
    total: numberRequired,
    selectedSize: { type: String, default: '' },
    selectedColor: { type: String, default: '' },

}, modelConfig))

module.exports = Detail