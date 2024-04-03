const otpGene = require('otp-generator')
function otpGenerator(num,uc,lc,sc) {
    const otp = otpGene.generate(num, { 
        upperCaseAlphabets: uc, 
        specialChars: sc,
        digits:true ,
        lowerCaseAlphabets : lc
    });
return `${otp}`;
}
module.exports = otpGenerator;