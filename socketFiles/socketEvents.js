const tryCatch = require("../helpers/trycatch");
const UserDetail = require("../models/UserDetail");
const UserFriend = require("../models/UserFriend");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.REACT_APP_SECRET;
const host = process.env.REACT_APP_HOST;
const connectedUserSockets = {}
const { setOnlineStatus, newNotification } = require('../utils/serverToServerRequest')
const socketEvents = (io) => {
    tryCatch(() => {
        io.on('connection', (socket) => {
            socket.on('mapUserId', ({ userAuthToken }) => {
                const data = jwt.verify(userAuthToken, secret);
                connectedUserSockets[data.user.id] = socket.id;
                socket.on('disconnect', () => {
                    delete connectedUserSockets[data.user.id];
                })
                socket.on('friendRequest', async ({ userAuthToken, friendId }) => {
                    const data = jwt.verify(userAuthToken, secret);
                    if (data) {
                        const isFriendExist = await UserFriend.findOne({ userId: data.user.id }).select(['friend', '-_id'])
                        const newNotificationArg = { userAuthToken, userId: data.user.id, friendId, socket, connectedUserSockets }
                        if (isFriendExist) {
                            if (!isFriendExist.friend.includes(friendId)) {
                                newNotification(newNotificationArg)
                            }
                        } else {
                            newNotification(newNotificationArg)
                        }
                    }
                })
                socket.on('connectChatRoom', async (data) => {
                    const { chatId, memberId, isGroup, userAuthToken } = data;
                    socket.join(chatId)
                    if (!isGroup) {
                        if (connectedUserSockets[memberId] !== undefined) {
                            socket.to(chatId).emit(chatId, { onlineStatus: true })
                            socket.emit(chatId, { onlineStatus: true })
                            setOnlineStatus(userAuthToken, true);
                        }
                        socket.on('disconnect', async () => {
                            socket.to(chatId).emit(chatId, { onlineStatus: false })
                            socket.emit(chatId, { onlineStatus: false });
                            setOnlineStatus(userAuthToken, false);
                        })
                    }
                })
                socket.on('sendMessage', (obj) => {
                    const { chatId, data } = obj;
                    socket.to(chatId).volatile.emit('receiveMessage', { ...data });
                })
            })
        })
    })
}
module.exports = socketEvents