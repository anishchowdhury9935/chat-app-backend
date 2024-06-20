const UserFriend = require("../../../models/UserFriend");
const UserDetail = require("../../../models/UserDetail");
async function idToEmail(id) {
    const list = []
    list.push()
    return { friend: list }
}
async function getUserFriendFunction(userId) {
    const getFriend = await UserFriend.findOne({ userId }).select(['-userId', '-_id', '-__v'])
    if (!getFriend) { return { friend: [] } }
    const friendList = await UserDetail.find({ _id: getFriend.friend }).select(['-password', '-date', '-__v', '-loginSession', '-OnlineStatus'])
    return { friend: friendList };
}
module.exports = getUserFriendFunction;