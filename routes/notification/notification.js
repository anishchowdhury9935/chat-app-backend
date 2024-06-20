const express = require("express");
const tryCatch = require("../../helpers/trycatch");
const router = express.Router();
const authorize = require("../../middleware/authorize");
const UserDetail = require("../../models/UserDetail");
const notificationDetails = require('../../models/Notification');
function sortByRecentDate(data) {
    return data.sort((a, b) => new Date(b.date) - new Date(a.date));
}

router.post('/new', authorize, async (req, res) => {
    const { user } = req.user;
    const { receiverId, type, notifyData } = req.body; //notifyData should be a object and type should be a string
    tryCatch(async () => {
        if (user.id === receiverId) {
            return res.status(200).json({ msg: "you can't notify yourself" })
        }
        const notificationData = {
            type,
            data: { ...notifyData }
        }
        const isExistNotification = await notificationDetails.find({ senderId: user.id, receiverId, 'notificationData.type': type })
        if (isExistNotification.length > 0) {
            return res.status(200).json({
                data: {
                    notificationExist: true
                }
            })
        }
        const newNotification = await notificationDetails.create({ senderId: user.id, receiverId, notificationData })
        return res.status(200).json({
            data: {
                notificationExist: false
            }
        })
    });
})

router.get('/get', authorize, async (req, res) => {
    const { user } = req.user;
    tryCatch(async () => {
        const getUserNotification = await notificationDetails.find({ receiverId: user.id }).select(['-receiverId', '-senderId'])
        res.status(200).json({ data: { notificationData: sortByRecentDate(getUserNotification) } });
    });
})

router.post('/delete', authorize, async (req, res) => {
    const { notificationId } = req.body
    tryCatch(async () => {
        const deleteNotification = await notificationDetails.deleteOne({ _id: notificationId })
        return res.status(200)
    });
})

















module.exports = router;
