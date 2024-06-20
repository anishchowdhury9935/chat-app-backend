const express = require("express");
const router = express.Router();
const authorize = require('../middleware/authorize');
const tryCatch = require('../helpers/trycatch')
const helperFunction = require('../helpers/helperFunction');
const UserDetail = require('../models/UserDetail')
const chatDetail = require('../models/chatDetail.js')
const message = require('../models/message.js')
const userChatFunctions = require('../utils/userChatFunctions')
const getUserFriendFunction = require("./userDetails/userfriendFunctions/getuserfriend");

router.post('/friend/:searchQuery', authorize, (req, res) => {
    const { user } = req.user
    const { SearchType } = req.body
    const searchQuery = req.params.searchQuery
    tryCatch(async () => {
        if (SearchType === 'email') {
            const findEmail = await UserDetail.find({ $and: [{ _id: { $ne: user.id } }, { $or: [{ email: { $regex: `^${searchQuery}`, $options: 'i' } }, { email: searchQuery }] }] }).select(['-__v', '-loginSession', '-date', '-password'])
            if (!findEmail) {
                return res.status(200).json({ msg: "No email found" })
            }
            return res.status(200).json({ searchData: findEmail })
        }
        if (SearchType === 'name') {
            const findName = await UserDetail.find({ $and: [{ _id: { $ne: user.id } }, { $or: [{ name: { $regex: `^${searchQuery}`, $options: 'i' } }, { name: searchQuery }] }] }).select(['-__v', '-loginSession', '-date', '-password'])
            if (!findName) {
                return res.status(200).json({ msg: "No email found" })
            }
            return res.status(200).json({ searchData: findName })
        }
    }, res)
})
router.get('/profile/:userId', authorize, (req, res) => {
    tryCatch(async () => {
        const userId = req.params.userId;
        if (!helperFunction.isMongoDbObject_id(userId)) {
            return res.status(200).json({ error: 'Profile not found ❌' })
        }
        const findProfile = await UserDetail.findById(userId).select(['-loginSession', '-password'])
        if (!findProfile) {
            return res.status(200).json({ error: 'Profile not found ❌' })
        }
        const findUserGroupChat = await chatDetail.find({ isGroup: true, member: { $in: [userId] } })
        const findUserGroupMember = await userChatFunctions.getAllUserGroupDetailsForSearch(findUserGroupChat)
        const getUserFriendDetails = await getUserFriendFunction(userId);
        res.status(200).json({ data: { profileData: findProfile, friendDetails: [...getUserFriendDetails.friend], groupDetail: [...findUserGroupMember] } })
    }, res)
})
module.exports = router;
