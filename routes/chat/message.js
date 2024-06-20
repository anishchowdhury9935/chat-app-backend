const express = require("express");
const tryCatch = require("../../helpers/trycatch");
const router = express.Router();
const authorize = require("../../middleware/authorize");
const Message = require("../../models/Message");
const fireStorage = require('../../firebase/FirebaseStorage.js');
const { v4: uuidv4 } = require('uuid');
const { ref, getDownloadURL, uploadBytesResumable } = require('firebase/storage');
const multer = require('multer');
const upload = multer({
    storage: multer.memoryStorage(),
    redirect: false,
    limits: { fileSize: 6 * 1024 * 1024 },
});
router.post('/new', authorize, upload.single('userAttachment'), (req, res) => {
    tryCatch(async () => {
        const { user } = req.user;
        const { chatId, type, content } = JSON.parse(req.body.data); // type should be only {"msg":true, "img":true}
        const findLastMsg = await Message.find({ chatId }).sort({count:-1}).limit(1).select(['count'])
        const count = !findLastMsg.length ? 0 : findLastMsg[0].count + 1
        const date = Date.now();
        if (type.msg && !type.img) {
            const createNewMessage = await Message.create({ chatId, content: { msg: content }, senderId: user.id, date, count });
            return res.status(200).json({
                data: {
                    chatId,
                    content: { msg: content },
                    senderId: user.id,
                    deleted: false,
                    type: 'msg',
                    date: Date(),
                    count
                }
            })
        }
        if (type.img && !type.msg) {
            const fileName = uuidv4();
            const findLastMsg = await Message.find({ chatId }).sort({count:-1}).limit(1).select(['count'])
        const count = !findLastMsg.length ? 0 : findLastMsg[0].count + 1
            const storageRef = ref(fireStorage, `userMessageImg/${fileName}`);
            const metadata = {
                contentType: req.file.mimetype,
                cacheControl: 'public,max-age=4000'
            }
            const uploadFile = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
            const imgUrl = await getDownloadURL(uploadFile.ref);
            const date = Date.now();
            const createNewImgMessage = await Message.create({ chatId, type: 'img', content: { img: imgUrl, imgCode: fileName }, senderId: user.id, date,count });
            return res.status(200).json({
                data: {
                    chatId,
                    content: { img: imgUrl },
                    senderId: user.id,
                    deleted: false,
                    type: 'img',
                    date: Date(),
                    count
                },
            })
        }
    }, res)
})
router.get('/get', authorize, (req, res) => {
    tryCatch(async () => {
        const chatId = req.header("chatId")
        const lastCount = req.header("lastCount")
        if (lastCount !== "false") {
            const findMessage = await Message.find({
                chatId,
                count: { $lt: lastCount },
            }).sort({count:-1}).limit(150)
            return res.status(200).json({
                data: {
                    message: [...findMessage]
                }
            })
        };
        const findMessage = await Message.find({ chatId }).sort({ count: -1 }).limit(15);
        return res.status(200).json({
            data: {
                message: [...findMessage]
            }
        })
    }, res)
})













module.exports = router;