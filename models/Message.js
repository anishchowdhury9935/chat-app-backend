const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema({
    chatId: {
        type: String,
        required: true
    },
    content: {
        type: Object,
        required: true
    },
    deleted: {
        type: Boolean,
        default: false
    },
    senderId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'msg' // this should only be "msg" or "img"
    },
    date: {
        type: Date,
        default: Date.now
    },
    count: {
        type: Number,
        required: true
    }
});
const message = mongoose.models.message || mongoose.model("message", messageSchema);

module.exports = message;
