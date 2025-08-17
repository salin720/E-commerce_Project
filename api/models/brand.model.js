const {Schema, model} = require ('mongoose')
const {stringRequired, booleanTrue, modelConfig} = require('../library/constants')

const Brand = model('Brand', new Schema({
    name: stringRequired,
    status: booleanTrue,

}, modelConfig))

module.exports = Brand