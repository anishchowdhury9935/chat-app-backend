const UserFriend = require("../../../models/UserFriend");
const UserDetail = require("../../../models/UserDetail");
async function idToEmail(id) {
    const list = []
    for (const i of id) {
        list.push(await UserDetail.findById(i).select(['-_id','-password','-date','-__v']))
    }
    return {friend: list}
}
async function getUserFriendFunction(userId) {
    const getFriend = await UserFriend.findOne({userId}).select(['-userId','-_id','-__v'])
    if(!getFriend){return "you have no friends yet"}
    const friendList = await idToEmail(getFriend.friend)
    return friendList;
}

module.exports = getUserFriendFunction;