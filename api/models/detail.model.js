const {Schema, model} = require ('mongoose')
const {modelConfig, numberRequired} = require('../library/constants')

const Detail = model('Detail', new Schema({
    orderId: {type: Schema.Types.ObjectId, required: true, ref: 'Order'},
    productId: {type: Schema.Types.ObjectId, required: true, ref: 'Product'},
    qty: numberRequired,
    price: numberRequired,
    total: numberRequired,

}, modelConfig))

module.exports = Detail