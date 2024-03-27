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
        default: null
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
    }
});

const Userdetail = mongoose.model("user_datas", userSchema);

module.exports = Userdetail;
