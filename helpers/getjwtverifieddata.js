const jwt = require('jsonwebtoken');
const secret = process.env.REACT_APP_SECRET;

function getJwtVerifiedData(authToken) {
    const data = jwt.verify(authToken, secret);
    return data
}

module.exports = getJwtVerifiedData;