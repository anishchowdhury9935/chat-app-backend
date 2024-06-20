const tryCatch = require("../helpers/trycatch");
const UserDetail = require("../models/UserDetail");
const UserFriend = require("../models/UserFriend");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.REACT_APP_SECRET;
const host = process.env.REACT_APP_HOST;
const index = {
    setOnlineStatus: (authToken, status) => {
        tryCatch(async () => {
            const url = `${host}/users/detail/userstatus`
            const data = {
                status
            }
            const response = await fetch(url, {
                method: 'post',
                headers: {
                    "content-type": "application/json",
                    "auth-token": `${authToken}`,
                },
                body: JSON.stringify(data)
            })
        });
    },
    newNotification: async ({ userAuthToken, userId, friendId, socket, connectedUserSockets }) => {
        const url = `${host}/notification/new`;
        const getSenderDetails = await UserDetail.findOne({ _id: userId }).select(['name', 'userImage', 'email'])
        const dataSend = {
            receiverId: friendId,
            type: "friendRequest",
            notifyData: {
                senderDetails: {
                    ...getSenderDetails
                }
            }
        }
        const response = await fetch(url, {
            method: 'post',
            headers: {
                "content-type": "application/json",
                'auth-token': userAuthToken
            },
            body: JSON.stringify(dataSend)
        });
        const value = await response.json()
        if (!value.data?.notificationExist) {
            if (connectedUserSockets[userId] !== connectedUserSockets[friendId]) {
                socket.to(connectedUserSockets[friendId]).emit("friendRequest", { data: undefined });
            }
        }
        return value
    }
}
module.exports = index;