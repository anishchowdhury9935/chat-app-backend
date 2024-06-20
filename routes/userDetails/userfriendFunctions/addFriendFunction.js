const UserFriend = require("../../../models/UserFriend");
const UserDetail = require("../../../models/UserDetail");

const getIdByEmail = async (email) => { //geting Id of friend email
	const getId = await UserDetail.findOne({ email: email }).select(['_id']);
	return getId._id.toString();
};

async function addFriendFunction(friendEmail, user_id) {
	const findUserEmail = await UserDetail.findOne({ _id: user_id }).select(["_id"]);
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
	const findFriendInUserFriend = await UserFriend.findOne({ userId: friendId });
	if (findUserInUserFriend) {
		// Check for existing friends if the user already has a record
		const existingFriends = findUserInUserFriend.friend;
		if (existingFriends.includes(friendId)) {
			return `${findfriendEmail.name} is already your friend`;
		}
		await UserFriend.updateOne({ userId: userId }, { $set: { friend: [...findUserInUserFriend.friend, friendId] } });
		if (findFriendInUserFriend) {
			await UserFriend.updateOne({ userId: friendId }, { $set: { friend: [...findFriendInUserFriend.friend, userId] } });
		}else{
			const addFriendTable = await UserFriend.create({
				userId: friendId,
				friend: [userId]
			});
		}
	} else {
		const addUserTable = await UserFriend.create({
			userId: userId,
			friend: [friendId]
		});
		const addFriendTable = await UserFriend.create({
			userId: friendId,
			friend: [userId]
		});
	}
	return `${findfriendEmail.name} is added to your friend list`;
}

exports.addFriendFunction = addFriendFunction;
