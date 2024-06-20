const UserDetail = require('../models/UserDetail')
const chatDetail = require('../models/chatDetail.js')
const index = {
    getAllUserGroupDetails: async (chatArray = []) => {
        const temObj = []
        for (let index = 0; index < chatArray.length; index++) {
            const chat = chatArray[index];
            const memberDetails = await UserDetail.find({ _id: chat.member }).select(['-password', '-loginSession'])
            const adminDetails = await UserDetail.findOne({ _id: chat.admin }).select(['-password', '-loginSession'])
            temObj.push({ chatImageUrl: chat.chatImageUrl, chatName: chat.chatName, member: memberDetails, admin: adminDetails, _id: chat._id });
        }
        return temObj;
    },
    getAllUserGroupDetailsForSearch: async (chatArray = []) => {
        const temObj = []
        for (let index = 0; index < chatArray.length; index++) {
            const chat = chatArray[index];
            const adminDetails = await UserDetail.findOne({ _id: chat.admin }).select(['name','_id'])
            temObj.push({ chatImageUrl: chat.chatImageUrl, chatName: chat.chatName, memberLength: chat.member.length, admin: adminDetails, _id: chat._id });
        }
        return temObj;
    },
}
module.exports = index