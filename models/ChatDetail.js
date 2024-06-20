const mongoose = require("mongoose");
const chatDetailSchema = new mongoose.Schema({
    chatName: {
        type: String
    },
    chatImageUrl: {
        type: Object
    },
    admin: {
        type: String
    },
    member: {
        type: Array,
        required: true
    }, isGroup: {
        type: Boolean,
        default: false
    }
});

const chatDetail = mongoose.models.chatDetail || mongoose.model("chatDetail", chatDetailSchema);

module.exports = chatDetail;
