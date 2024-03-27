const UserFriend = require("../../../models/UserFriend");
const UserDetail = require("../../../models/UserDetail");

const getIdByEmail = async (email) => { //geting Id of friend email
	const getId = await UserDetail.findOne({ email: email }).select(['_id']);
	return getId._id.toString();
};

async function addFriendFunction(friendEmail, userEmail) {
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
		// Check for existing friends if the user already has a record
		const existingFriends = findUserInUserFriend.friend;
		if (existingFriends.includes(friendId)) {
			return `${friendEmail} is already your friend`;
		}
		await UserFriend.updateOne({ userId: userId }, { $set: { friend: [...findUserInUserFriend.friend, friendId] } });
	} else {
		const newUserFriend = await UserFriend.create({
			userId: userId,
			friend: [friendId]
		});
	}

	return `${friendEmail}is added to your friend list`;
}

exports.addFriendFunction = addFriendFunction;
