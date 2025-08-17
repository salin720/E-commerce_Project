const {Schema, model} = require ('mongoose')
const {stringRequired, booleanTrue, modelConfig, numberRequired} = require('../library/constants')

const Product = model('Product', new Schema({
    name: stringRequired,
    description: stringRequired,
    shortDescription: stringRequired,
    price: numberRequired,
    discountedPrice: {type: Number, default: 0},
    categoryId: {type: Schema.Types.ObjectId, required: true, ref: 'Category'},
    brandId: {type: Schema.Types.ObjectId, required: true, ref: 'Brand'},
    images: [stringRequired],
    status: booleanTrue,
    featured: {type: Boolean, default: false}, 
}, modelConfig))

module.exports = Product