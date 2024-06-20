const mongoose = require("mongoose");
const userFriendSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        // unique: true
    },
    friend: {
        type: Array,
        required: true,
    },
});

const UserFriend = mongoose.model("userfriends", userFriendSchema);

module.exports = UserFriend;
