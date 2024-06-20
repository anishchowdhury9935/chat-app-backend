function compareDate(dateTimeString) {
    const dateObj = new Date(dateTimeString);

    const now = new Date();

    const delta = now - dateObj;

    const minute = 60 * 1000;
    const hour = minute * 60;
    const day = hour * 24;
    const month = day * 30;
    const year = month * 12;

    const years = Math.floor(delta / year);
    const months = Math.floor((delta % year) / month);
    const days = Math.floor((delta % month) / day);

    if (delta < 0) {
        return "Future time";
    } if (years > 0) {
        return `${years} years ago`;
    } if (months > 0) {
        return `${months} months ago`;
    } if (days > 0) {
        return `${days} day ago`;
    } else {
        return "Today";
    }
}

const index = {
    calculateChatHours: (messages) => {
        let mappedMessages = {};
        let chatActivity = {};
        let lastChatted = {}
        for (const message of messages) {
            const chatId = message.chatId;
            if (!mappedMessages[chatId]) {
                mappedMessages[chatId] = [message];
            } else {
                mappedMessages[chatId].push(message);
            }
        }
        for (const chatId in mappedMessages) {
            const chatMessages = mappedMessages[chatId];
            if (chatMessages.length < 2) {
                chatActivity[chatId] = { duration: 0 }; // Not enough data to calculate duration
                continue;
            }
            // Sort messages by date
            chatMessages.sort((a, b) => new Date(a.date) - new Date(b.date));
            let totalDuration = 0; // in milliseconds
            for (let i = 1; i < chatMessages.length; i++) {
                const duration = new Date(chatMessages[i].date) - new Date(chatMessages[i - 1].date);
                if (duration < 60 * 60 * 1000) { // 1 hour threshold
                    totalDuration += duration;
                }
            }
            // Convert total duration from milliseconds to hours
            const totalHours = (totalDuration / (1000 * 60 * 60)).toFixed(2);
            chatActivity[chatId] = { duration: (totalHours) };
            const lastMsg = chatMessages[chatMessages.length - 1]
            const msgDate = new Date(lastMsg.date)
            const comparedDate = compareDate(msgDate)
            lastChatted = { ...lastChatted, [chatId]: comparedDate };
        }
        return { chatActivity, lastChatted };
    }, isMongoDbObject_id: (text) => {
        return text && text.length === 24 && /^[0-9a-f]+$/.test(text);
    }
}


module.exports = index;