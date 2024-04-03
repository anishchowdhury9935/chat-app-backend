const bcrypt = require("bcrypt");
async function getHashData(data) {
    const salt = bcrypt.genSaltSync(10);
    const secPassword = bcrypt.hashSync(data, salt);
    return secPassword;
}
module.exports = getHashData;