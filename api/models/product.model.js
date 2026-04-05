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
    stock: {type: Number, default: 0},
    totalViews: {type: Number, default: 0},
    totalSold: {type: Number, default: 0},
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    priceHistory: {
        type: [{ price: { type: Number, required: true }, recordedAt: { type: Date, default: Date.now } }],
        default: [],
    },
}, modelConfig))

module.exports = Product
