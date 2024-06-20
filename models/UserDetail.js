const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    userImage: {
        type: String,
        default: "https://firebasestorage.googleapis.com/v0/b/chat-app-b2168.appspot.com/o/userProfile%2FdefualtImage?alt=media&token=67059014-fdb9-45a3-b255-a9b259c2f381"
    },
    password: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        default: Date.now,
    },
    loginSession: {
        type: String,
        required: true,
    },
    OnlineStatus: {
        type: Boolean,
        required: false,
        default: false,
    }
});

const Userdetail = mongoose.model("user_datas", userSchema);

module.exports = Userdetail;
