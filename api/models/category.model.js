const {Schema, model} = require ('mongoose')
const {stringRequired, booleanTrue, modelConfig} = require('../library/constants')

const Category = model('Category', new Schema({
    name: stringRequired,
    status: booleanTrue,
    image: { type: String, trim: true, default: null },

}, modelConfig))

module.exports = Category