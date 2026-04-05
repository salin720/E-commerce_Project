const {Schema, model} = require ('mongoose')
const {stringRequired, booleanTrue, modelConfig} = require('../library/constants')

const Brand = model('Brand', new Schema({
    name: stringRequired,
    status: booleanTrue,
    image: { type: String, trim: true, default: null },

}, modelConfig))

module.exports = Brand