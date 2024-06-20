const express = require("express");
const router = express.Router();
const authorize = require('../../middleware/authorize');
const {addFriendFunction} = require("./userfriendFunctions/addFriendFunction");
const removeFriendFunction = require("./userfriendFunctions/removeuserfriend");
const getUserFriendFunction = require("./userfriendFunctions/getuserfriend");
const tryCatch = require('../../helpers/trycatch')
router.post("/adduserfriend", authorize, async (req, res) => {
	tryCatch(async()=> {
        const { user } = req.user 
        const { friendEmail } = req.body //friendEmail & userEmail will be a string 
		const msg = await addFriendFunction(friendEmail, user.id);
		res.status(200).json({ msg })
    },res)
});
router.post("/removeuserfriend", authorize, async (req, res) => {
    tryCatch(async()=>{
        const { friendEmail } = req.body //friendEmail & userEmail will be a string 
        const { user } = req.user;
        const msg  = await removeFriendFunction(friendEmail, user.id);
        res.status(200).json({ msg })
    },res)
});
router.get("/getuserfriend", authorize, async (req, res) => {
    tryCatch(async()=>{
        const { user } = req.user //friendEmail & userEmail will be a string 
		const msg  = await getUserFriendFunction(user.id);
		res.status(200).json(msg)
    },res)
});

module.exports = router;
