const express = require("express");
const tryCatch = require("../../helpers/trycatch");
const helperFunction = require("../../helpers/helperFunction.js");
const router = express.Router();
const authorize = require("../../middleware/authorize");
const chatDetail = require('../../models/ChatDetail');
const Userdetail = require("../../models/UserDetail");
const fireStorage = require('../../firebase/FirebaseStorage.js');
const { ref, getDownloadURL, uploadBytesResumable, deleteObject } = require('firebase/storage');
const multer = require('multer');
const crypto = require('node:crypto');
const message = require("../../models/Message.js");
const upload = multer({
    storage: multer.memoryStorage(),
    redirect: false,
    limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/newChat', authorize, upload.single('groupChatImage'), (req, res) => {
    const { user } = req.user;
    const { chatName, member, isGroup } = JSON.parse(req.body.data);
    tryCatch(async () => {
        if (chatName.length < 5) {
            return res.status(200).json({ error: "group name should be of min 5 characters" })
        }
        const isGroupChatExist = await chatDetail.findOne({ $and: [{ chatName }, { admin: user.id }] }).select(['-_id'])
        if (isGroupChatExist) { return res.status(200).json({ msg: 'This name is already used please take another name for this group chat' }) }
        if (!req.file) {
            const newGroupChat = await chatDetail.create({ chatName, admin: user.id, member: [...member, user.id], isGroup, chatImageUrl: { img: 'https://firebasestorage.googleapis.com/v0/b/chat-app-b2168.appspot.com/o/userProfile%2FdefualtImage?alt=media&token=67059014-fdb9-45a3-b255-a9b259c2f381', imgCode: false } })
            return res.status(200).json({ msg: "group is been created" })
        }
        const imgCode = crypto.randomBytes(32).toString("hex");
        const storageRef = ref(fireStorage, `userGroup/${imgCode}groupChatImage`)
        const metadata = {
            contentType: req.file.mimetype,
            cacheControl: 'public,max-age=3600'
        }
        const uploadFile = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
        const GroupProfileUrl = await getDownloadURL(uploadFile.ref)
        const newGroupChat = await chatDetail.create({ chatName, chatImageUrl: { img: GroupProfileUrl, imgCode }, admin: user.id, member: [...member, user.id], isGroup })
        return res.status(200).json({ msg: "group is been created" })
    }, res)
});
router.post('/newPrivateChat', authorize, (req, res) => {
    const { user } = req.user;
    const { member, isGroup } = req.body;
    tryCatch(async () => {
        if (!isGroup) {
            const isChatExist = await chatDetail.findOne({ member: { $in: [...member, user.id] }, isGroup: false }).select(['__v', "-_id"])
            if (isChatExist) { return res.status(200).json({ msg: "you are already chating" }) }
            const findFriend = await Userdetail.find({ _id: member[0] }).select(['name'])
            if (!findFriend) { return res.status(200).json({ msg: "no account with this friend email" }) }
            const newChatPrivate = await chatDetail.create({ member: [...member, user.id] });
            return res.status(200).json({ msg: `new chat with '${findFriend[0].name}' is created` })
        }
        return res.status(200).json({ error: 'internal server error' })
    }, res)
});
router.get('/getUserChat', authorize, (req, res) => {
    tryCatch(async () => {
        const { user } = req.user
        const findChat = await chatDetail.find({ member: { $in: [user.id] } })
        const chatDetails = [];
        for (let index = 0; index < findChat.length; index++) {
            const chat = findChat[index];
            const lastMsg = await message.find({ chatId: chat._id }).sort({ count: -1 }).limit(1).select(['content', 'date', 'type'])
            if (!chat.isGroup) {
                const memberIds = chat.member.filter(mId => mId !== user.id);
                for (const mId of memberIds) {
                    const memberDetails = await Userdetail.findOne({ _id: mId }).select(['-loginSession', '-password', '-date'])
                    chatDetails.push({ chatId: chat._id, chatName: memberDetails.name, chatImage: memberDetails.userImage, member: memberDetails, isGroup: chat.isGroup, lastMsg });
                }
            } else {
                const memberIds = chat.member.filter(mId => mId !== user.id);
                const memberDetails = await Userdetail.find({ _id: memberIds }).select(['-loginSession', '-password', '-date', '-OnlineStatus'])
                const findAdmin = await Userdetail.findOne({ _id: chat.admin }).select(['name'])
                chatDetails.push({ chatId: chat._id, chatName: chat.chatName, chatImage: chat.chatImageUrl.img, member: memberDetails, isGroup: chat.isGroup, admin: findAdmin.name, lastMsg });
            }
        }
        res.status(200).json({ data: { chatDetails } });
    }, res);
});
router.post('/updateUserChat', authorize, upload.single('groupChatImage'), (req, res) => {
    tryCatch(async () => {
        const { user } = req.user;
        const { chatId, isGroup, chatData } = req.body;
        const findChat = await chatDetail.findOne({ _id: chatId })
        if (!chatData) { return res.status(200).json({ error: 'chatData can not be empty' }); }
        if (!findChat) {
            return res.status(200).json({ error: 'Chat not found' });
        }
        if (!isGroup) {
            const newMemberArray = findChat.member.filter((memId) => { return memId !== user.id });
            const updateChat = await chatDetail.updateOne({ _id: chatId }, { member: [...newMemberArray] })
            return res.status(200).json({ msg: 'you have successfully leaved the chat' });
        }
        const isUserAdmin = user.id === findChat.admin;
        if (!isUserAdmin) { return res.status(200).json({ error: 'only admins can update this chat' }); }
        const { chatName, removeMemberId } = chatData;
        if (removeMemberId) {
            const newMemberArray = findChat.member.filter((memId) => { return memId !== removeMemberId });
            const removeMemberId = await chatDetail.updateOne({ _id: chatId }, { member: [...newMemberArray] })
        } if (chatName) {
            const updateChatName = await chatDetail.updateOne({ _id: chatId }, { chatName })
        }
        if (findChat.chatImageUrl.imgCode) {
            const storageRef = ref(fireStorage, `userGroup/${findChat.chatImageUrl.imgCode}groupChatImage`)
            await deleteObject(storageRef)
        }
        const imgCode = crypto.randomBytes(32).toString("hex");
        const metadata = {
            contentType: req.file.mimetype,
            cacheControl: 'public,max-age=3600'
        }
        const uploadFile = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
        const GroupProfileUrl = await getDownloadURL(uploadFile.ref)
        const updateImageUrl = await chatDetail.updateOne({ _id: chatId }, { chatImageUrl: { img: GroupProfileUrl, imgCode } });
        return res.status(200).json({ msg: 'profile updated successfully', shouldProceed: true });
    }, res);
});
router.get('/activity', authorize, (req, res) => {
    tryCatch(async () => {
        const { user } = req.user;
        const today = new Date();
        const daysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
        const findMessage = await message.find({
            date: { $gte: daysAgo },
            senderId: user.id
        }).select('-_id').sort({ date: 1 });
        if (findMessage.length) {
            const calculatedDuration = helperFunction.calculateChatHours(findMessage)
            return res.status(200).json({ data: { ...calculatedDuration, hasMsg: true } })
        }
        const isMsgThere = await message.find({ senderId: user.id }).limit(1).select(['_id'])
        if (isMsgThere.length) {
            return res.status(200).json({ data: { chatActivity: {}, lastChatted: {}, hasMsg: true } })
        }
        res.status(200).json({ data: { chatActivity: {}, lastChatted: {}, hasMsg: false } })
    }, res)
})
router.get('/get/group/details', authorize, (req, res) => {
    tryCatch(async () => {
        const groupId = req.headers.get('groupId');
        const isByUser = req.headers.get('isByUser');
        const findUserGroup = await chatDetail.find({ _id: groupId })
        return { data: { groupDetail: findUserGroup } }
    }, res)
})


module.exports = router;

