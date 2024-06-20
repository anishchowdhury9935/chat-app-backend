const express = require("express");
require("dotenv").config();
const router = express.Router();
const UserDetails = require("../../models/UserDetail");
const authorize = require("../../middleware/authorize");
const { body, validationResult } = require("express-validator");
const tryCatch = require("../../helpers/trycatch");
const fireStorage = require('../../firebase/FirebaseStorage.js');
const { ref, getDownloadURL, uploadBytesResumable } = require('firebase/storage');
const multer = require('multer');
const Userdetail = require("../../models/UserDetail");
const upload = multer({
	storage: multer.memoryStorage(),
	redirect: false,
	limits: { fileSize: 5 * 1024 * 1024 },
});
// get user details/data
router.get("/getuserdetails", authorize, async (req, res) => {
	tryCatch(async () => {
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
router.put("/setuserdetails",
	[
		body("email", "Enter a valid email").isEmail(),
		body("name", "Name must be minimum 5 and maximum 20").isLength({
			min: 5,
			max: 20,
		}),
	],
	authorize,
	async (req, res) => {
		tryCatch(async () => {
			const Validation_errors = validationResult(req);
			if (!Validation_errors.isEmpty()) {
				return res.status(200).json({ error: Validation_errors.errors[0].msg });
			}
			const { name, email } = req.body;
			const user = await req.user;
			const updateFields = {};
			if (name) updateFields.name = name;
			if (email) updateFields.email = email;
			if (Object.keys(updateFields).length > 0) {
				const updated = await UserDetails.updateOne(
					// updating the fields
					{ _id: user.user.id },
					{ $set: updateFields },
				);
				if (updated.modifiedCount > 0) {
					res.status(200).json({ msg: "updated successfully✅" });
				} else {
					res.status(200).json({ msg: "No updates made" });
				}
			} else {
				res.status(200).json({ msg: "No fields to update" });
			}
		});
	},
);
router.post('/uploaduserprofile', authorize, upload.single('userProfile'), async (req, res) => { //**********//
	tryCatch(async () => {
		if (req.file?.mimetype.slice(0, 5) !== 'image') {
			res.status(200).json({ error: "profile should only be an image type" })
		}
		const user = await req.user;
		const storageRef = ref(fireStorage, `userProfile/${user.user.id}`)
		// const userData = await Userdetail.findById(user.user.id).select(['userImage'])
		const metadata = {
			contentType: req.file.mimetype,
			cacheControl: 'public,max-age=36000'
		}
		const uploadFile = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
		const profileUrl = await getDownloadURL(uploadFile.ref)
		const saveUserProfileUrl = await Userdetail.updateOne({ _id: user.user.id }, { userImage: profileUrl })
		res.status(200).json({ msg: "profile saved" })
	})
})
router.post("/userstatus", authorize, async (req, res) => {
	tryCatch(async () => {
		const { user } = req.user;
		const { status } = req.body;
		tryCatch(async () => {
			const updateStatus = await UserDetails.updateOne({ _id: user.id }, { $set: { OnlineStatus: status } })
			if (!updateStatus) {
				return res.status(500);
			}
			return res.status(200);
		}, res)
	}, res)
});
module.exports = router;
