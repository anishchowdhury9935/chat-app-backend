const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema({
    senderId: {
        type: 'string',
        required: true
    }, receiverId: {
        type: 'string',
        required: true
    },
    notificationData: {
        type: Object,
        required: true,
    },
    date:{
        type: Date,
        default: Date.now
    }
});

const notificationDetails = mongoose.model("notificationDetails", notificationSchema);

module.exports = notificationDetails;