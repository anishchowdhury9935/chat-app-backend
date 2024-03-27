const express = require("express");
const router = express.Router();
const authorize = require('../../middleware/authorize');
const {addFriendFunction} = require("./userfriendFunctions/addFriendFunction");
const removeFriendFunction = require("./userfriendFunctions/removeuserfriend");
const getUserFriendFunction = require("./userfriendFunctions/getuserfriend");
const tryCatch = require('../../helpers/trycatch')
router.post("/adduserfriend", authorize, async (req, res) => {
	tryCatch(async()=> {
        const { friendEmail, userEmail } = req.body //friendEmail & userEmail will be a string 
		const msg = await addFriendFunction(friendEmail, userEmail);
		res.status(200).json({ msg })
    })
});
router.post("/removeuserfriend", authorize, async (req, res) => {
    tryCatch(async()=>{
        const { friendEmail, userEmail } = req.body //friendEmail & userEmail will be a string 
        const msg  = await removeFriendFunction(friendEmail, userEmail);
        res.status(200).json({ msg })
    })
});
router.get("/getuserfriend", authorize, async (req, res) => {
    tryCatch(async()=>{
        const { user } = req.user //friendEmail & userEmail will be a string 
		const msg  = await getUserFriendFunction(user.id);
		res.status(200).json({msg})
    })
});

module.exports = router;
