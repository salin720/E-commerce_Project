const {Schema, model} = require('mongoose')
const {modelConfig} = require('../library/constants')

const Wishlist = model('Wishlist', new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    productId: {type: Schema.Types.ObjectId, ref: 'Product', required: true},
    active: {type: Boolean, default: true},
}, modelConfig))

module.exports = Wishlist
