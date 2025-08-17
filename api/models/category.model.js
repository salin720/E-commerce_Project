const {Schema, model} = require ('mongoose')
const {stringRequired, booleanTrue, modelConfig} = require('../library/constants')

const Category = model('Category', new Schema({
    name: stringRequired,
    status: booleanTrue,

}, modelConfig))

module.exports = Category