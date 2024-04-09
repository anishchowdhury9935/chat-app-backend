const getJwtVerifiedData = require('../../helpers/getJwtVerifiedData');
const express = require("express");
const tryCatch = require("../../helpers/trycatch");
const UserDetail = require("../../models/UserDetail");
const { body, validationResult } = require("express-validator");
const otpGenerator = require("../../helpers/otpgenerator");
const OTP = require('../../models/OTP');
const getAuthToken = require("../../helpers/getauthtoken");
const router = express.Router();
router.post("/send", [
    body("email", "Enter a valid email").isEmail()
], async (req, res) => {
    tryCatch(async () => {
        const { email, shouldProceed, type } = req.body;
        const Validation_errors = validationResult(req);
        if (!Validation_errors.isEmpty()) {
            return res.status(200).json({ error: Validation_errors.errors[0].msg, verifyConform: false });
        }
        if (!shouldProceed) { return res.status(200).json({ error: 'Email or password is incorrect', shouldProceed: false }); }
        if (type === 'login') {
            const isEmailExist = await UserDetail.findOne({ email })
            if (!isEmailExist) { return res.status(200).json({ error: "There is no account with this email id ", shouldProceed: false }); }
        }
        const otp = getAuthToken({ OtpDATA: otpGenerator(6, false, false, false) });
        const saveOtp = await OTP.create({ email, otp });
        if (!saveOtp) { return res.status(200).json({ error: "error while sending OTP", shouldProceed: false }); }
        return res.status(200).json({ shouldProceed: true, email,msg:"otp is sended please check your email" });
    }, res)
});
router.post("/confirm", [
    body("email", "Enter a valid email").isEmail()
], async (req, res) => {
    tryCatch(async () => {
        const { email, shouldProceed, otp } = req.body;
        if (!shouldProceed) { return res.status(200).json({ error: 'Email or password is incorrect', verifyConform: false }) };
        const Validation_errors = validationResult(req);
        if (!Validation_errors.isEmpty()) {
            return res.status(200).json({ error: Validation_errors.errors[0].msg, verifyConform: false });
        }
        const latestOtp = await OTP.find({ email }).sort({ _id: -1 }).limit(1).select(["otp", '-_id']);
        if (latestOtp.length) {
            const data = getJwtVerifiedData(latestOtp[0].otp)
            const isOtpCorrect = `${data.OtpDATA}` === `${otp}`;
            if (!isOtpCorrect) {
                return res.status(200).json({ error: 'OTP is invalid❌', verifyConform: false });
            }
            const deleteOtp = await OTP.deleteMany({ email });
            return res.status(200).json({ msg: 'OTP verified know you can close this tab', verifyConform: true });
        }
        return res.status(200).json({ error: 'OTP is expired', verifyConform: false })
    }, res)
});



module.exports = router;