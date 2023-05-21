const mongoose = require('mongoose');

const friendRequestSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        recipient: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        status: {
            type: String,
            required: true,
        },
        friendshipParticipants: {
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

module.exports = mongoose.model('FriendRequest', friendRequestSchema);
