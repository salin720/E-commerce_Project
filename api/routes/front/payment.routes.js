const express = require("express");
const router = express.Router();
const {
    createPayment,
    verifyPayment
} = require("../../controllers/front/payment.controller");
const {auth, customerOnly} = require("@/library/middlewares");

router.post("/domi/create", auth, customerOnly, createPayment);
router.get("/domi/verify", verifyPayment);

module.exports = router;
