const {Schema, model} = require ('mongoose')
const {stringRequired, booleanTrue, modelConfig} = require('../library/constants')

const User = model('User', new Schema({
    name: stringRequired,
    email: {...stringRequired, unique: true},
    password: {...stringRequired, select: false},
    phone: {...stringRequired, maxlength: [20, 'Phone number must be less than 20 characters.']},
    address: stringRequired,
    role: {type: String, enum: ['Admin', 'Staff', 'Customer'], default: 'Customer'},
    status: booleanTrue,

}, modelConfig))

module.exports = User