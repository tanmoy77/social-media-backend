const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
    {
        members: {
            type: [
                {
                    type: mongoose.Types.ObjectId,
                    ref: 'User',
                },
            ],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Conversation', conversationSchema);
