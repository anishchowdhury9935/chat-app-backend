const otpGenerator = require('otp-generator')
const jwt = require("jsonwebtoken");
require("dotenv").config();
function getLoginSession(){
    const secret = process.env.REACT_APP_SECRET;
    const session = otpGenerator.generate(40, { 
        upperCaseAlphabets: true, 
        specialChars: true,
        digits: true,
        lowerCaseAlphabets : true
    });
    const loginSession = jwt.sign(session, secret)
    return loginSession;
}
module.exports = getLoginSession