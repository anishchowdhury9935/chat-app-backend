// const otpGenerator = require('otp-generator')
const otpGenerator = require('./otpgenerator.js')
const jwt = require("jsonwebtoken");
require("dotenv").config();
function getLoginSession(){
    const secret = process.env.REACT_APP_SECRET;
    const session = otpGenerator(40,true,true,true);
    const loginSession = jwt.sign(session, secret)
    return loginSession;
}
module.exports = getLoginSession