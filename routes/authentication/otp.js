const express = require("express");
const tryCatch = require("../../helpers/trycatch");
const UserDetail = require("../../models/UserDetail");
const { body, validationResult } = require("express-validator");
const otpGenerator = require("../../helpers/otpgenerator");
const OTP = require('../../models/OTP');
const getAuthToken = require("../../helpers/getauthtoken");
require("dotenv").config();
const router = express.Router();
const getJwtVerifiedData = require('../../helpers/getJwtVerifiedData');
router.post("/send",  async (req, res) => {
    tryCatch(async () => {
        const { email,shouldProceed } = req.body;
        if(!shouldProceed){return res.status(400).json({error:'Email or password is incorrect',shouldProceed:false});}
        const isEmailExist = await UserDetail.findOne({email})
        if(!isEmailExist) {return res.status(400).json({ error: "There is no account with this email id ",shouldProceed:false});}
        const otp = getAuthToken({OtpDATA: otpGenerator(6,true,false,false)});
        const saveOtp = await OTP.create({email, otp});
        if(!saveOtp) {return res.status(400).json({ error: "error while sending OTP",shouldProceed:false });}
        return res.status(200).json({shouldProceed:true,email});
    }, res)
});
router.post("/confirm", [
    body("email", "Enter a valid email").isEmail()
], async (req, res) => {
    tryCatch(async () => {
        const { email,shouldProceed,otp } = req.body;
        if(!shouldProceed){return res.status(400).json({error:'Email or password is incorrect',LoginConform:false})};
        const Validation_errors = validationResult(req);
        if (!Validation_errors.isEmpty()) {
            return res.status(400).json({ error: Validation_errors.errors[0].msg,LoginConform:false });
        }
        const latestOtp = await OTP.find({ email }).sort({ _id: -1 }).limit(1).select(["otp",'-_id']);
        if (latestOtp.length) {
            const data = getJwtVerifiedData(latestOtp[0].otp)
            const isOtpCorrect = `${data.OtpDATA}` === `${otp}`;
            if (!isOtpCorrect) {
                return res.status(400).json({error:'OTP is invalid❌',LoginConform:false});
            }
            return res.status(200).json({msg:'OTP verified✅',LoginConform:true});
        }
        return res.status(400).json({error:'OTP is expired',LoginConform:false})
    }, res)
});



module.exports = router;