const crypto = require("crypto");
const esewaConfig = require("../config/esewa");

const generateEsewaSignature = ({ total_amount, transaction_uuid, product_code }) => {
    const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

    return crypto
        .createHmac("sha256", esewaConfig.secretKey)
        .update(message)
        .digest("base64");
};

const verifyEsewaSignature = (signedFieldNames, payload, signature) => {
    const message = signedFieldNames
        .split(",")
        .map((field) => `${field}=${payload[field]}`)
        .join(",");

    const generated = crypto
        .createHmac("sha256", esewaConfig.secretKey)
        .update(message)
        .digest("base64");

    return generated === signature;
};

module.exports = {
    generateEsewaSignature,
    verifyEsewaSignature,
};