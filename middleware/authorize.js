const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.REACT_APP_SECRET;
const UserDetails = require("../models/UserDetail");
async function authorize(req, res, next) {
	const token = await req.header("auth-token"); // auth token coming from headers
	try {
		const data = jwt.verify(token, secret);
		const userVerify = await UserDetails.findOne({ _id: data.user.id }).select(['-_id'])
		if (!userVerify) {
			return res.status(401).json({ error: "User not found⚠️" });
		}
		req.user = data;
		next();
	} catch (error) {
		res.status(401).json({ error: "Authorization error⚠️" });
	}
}
module.exports = authorize; 