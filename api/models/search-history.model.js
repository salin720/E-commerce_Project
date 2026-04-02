const {Schema, model} = require('mongoose')
const {modelConfig} = require('../library/constants')

const SearchHistory = model('SearchHistory', new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    query: {type: String, required: true},
    normalizedQuery: {type: String, required: true},
    resultCount: {type: Number, default: 0},
    clickedProductId: {type: Schema.Types.ObjectId, ref: 'Product', default: null},
    searchedAt: {type: Date, default: Date.now},
}, modelConfig))

module.exports = SearchHistory
