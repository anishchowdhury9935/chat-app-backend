const UserFriend = require("../../../models/UserFriend");
const UserDetail = require("../../../models/UserDetail");

const getIdByEmail = async (email) => { //geting Id of friend email
    const getId = await UserDetail.findOne({ email: email }).select(['_id']);
    return getId._id.toString();
};
function excludeFriendId(existingFriends, friendId) {
    return existingFriends.filter(friend => friend !== friendId);
}

async function removeFriendFunction(friendEmail, userEmail) {
    const findUserEmail = await UserDetail.findOne({ email: userEmail }).select(["_id"]);
    const findfriendEmail = await UserDetail.findOne({ email: friendEmail });

    if (!findUserEmail) {
        return "Email address is wrong";
    }

    if (!findfriendEmail) {
        return `There is no account with this email: ${friendEmail}`;
    }
    const userId = findUserEmail._id;
    const friendId = await getIdByEmail(friendEmail);
    const findUserInUserFriend = await UserFriend.findOne({ userId: userId });
    if (findUserInUserFriend) {
        const existingFriends = findUserInUserFriend.friend;
        if(existingFriends.length === 0){return "you have no friends yet";}
        const newFriendList = excludeFriendId(existingFriends, friendId);
        const saveNewFriendList = await UserFriend.updateOne({ userId: userId }, { $set: { friend: [...newFriendList] } });
        return `${friendEmail} removed from your friend list`;
    }
    return "you have no friends yet";
}

module.exports = removeFriendFunction;