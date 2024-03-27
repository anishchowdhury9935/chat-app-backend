const bcrypt = require("bcrypt");
async function getHashData(password) {
    const salt = bcrypt.genSaltSync(10);
    const secPassword = bcrypt.hashSync(password, salt);
    return secPassword;
}
module.exports = getHashData;