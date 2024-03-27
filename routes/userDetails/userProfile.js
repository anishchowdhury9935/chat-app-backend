const express = require("express");
require("dotenv").config();
const router = express.Router();
const UserDetails = require("../../models/UserDetail");
const authorize = require("../../middleware/authorize");
const { body, validationResult } = require("express-validator");
const tryCatch = require("../../helpers/trycatch");
// get user details/data
router.get("/getuserdetails", authorize, async (req, res) => {
	tryCatch(async()=>{
        const { user } = req.user;
		const userData = await UserDetails.findById(user.id).select([
			"-password",
			"-__v",
			"-isLogin",
			"-loginSession"
		]);
		res.status(200).json({ userData });
    })
});
// update user details/data
router.put(
	"/setuserdetails",
	[
		body("email", "Enter a valid email").isEmail(),
		body("name", "Name must be minimum 5 and maximum 20").isLength({
			min: 5,
			max: 20,
		}),
	],
	authorize,
	async (req, res) => {
		tryCatch(async()=>{
            const Validation_errors = validationResult(req);
			if (!Validation_errors.isEmpty()) {
				return res.status(400).json({ error: Validation_errors.errors[0].msg });
			}
			const { name, email } = req.body;
			const user = await req.user;
			const updateFields = {};
			if (name) updateFields.name = name;
			if (email) updateFields.email = email;
			if (Object.keys(updateFields).length > 0) {
				const updated = await UserDetails.updateOne(
					// udating the fields
					{ _id: user.user.id },
					{ $set: updateFields },
				);
				if (updated.modifiedCount > 0) {
					res.status(200).json({ msg: "updated successfully✅" });
				} else {
					res.status(400).json({ msg: "No updates made" });
				}
			} else {
				res.status(400).json({ msg: "No fields to update" });
			}
        });
	},
);

module.exports = router;
