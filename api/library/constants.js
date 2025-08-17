const stringRequired = {type: String, required: true}
const booleanTrue = {type: Boolean, default: true}

const modelConfig = {
    timestamps: true,
    autoIndex: true,
    autoCreate: true,
}

const numberRequired = {type: Number, required: true}

module.exports = {stringRequired, booleanTrue, modelConfig, numberRequired}