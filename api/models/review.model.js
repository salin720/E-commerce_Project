const {Schema, model} = require ('mongoose')
const {stringRequired, booleanTrue, modelConfig, numberRequired} = require('../library/constants')

const Review = model('Review', new Schema({
    comment: stringRequired,
    rating: stringRequired,
    productId: {type: Schema.Types.ObjectId, required: true, ref: 'Product'},
    userId: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
}, modelConfig))

module.exports = Review