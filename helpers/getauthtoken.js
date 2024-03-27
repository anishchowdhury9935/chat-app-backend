const jwt = require("jsonwebtoken");
require("dotenv").config();
function getAuthToken(data) {
    const secret = process.env.REACT_APP_SECRET;
    const authToken = jwt.sign(data, secret);
    return authToken
}



module.exports = getAuthToken