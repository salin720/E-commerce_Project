const {Schema, model} = require('mongoose')
const {modelConfig} = require('../library/constants')

const ProductView = model('ProductView', new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    productId: {type: Schema.Types.ObjectId, ref: 'Product', required: true},
    categoryId: {type: Schema.Types.ObjectId, ref: 'Category'},
    brandId: {type: Schema.Types.ObjectId, ref: 'Brand'},
    source: {type: String, default: 'detail'},
    viewedAt: {type: Date, default: Date.now},
}, modelConfig))

module.exports = ProductView
