const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
        },
        postId: {
            type: mongoose.Types.ObjectId,
            ref: 'Post',
        },
        postAuthorId: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
        },
        text: {
            type: String,
            required: true,
        },
        likes: {
            type: [
                {
                    type: mongoose.Types.ObjectId,
                    ref: 'User',
                },
            ],
        },
        dislikes: {
            type: [
                {
                    type: mongoose.Types.ObjectId,
                    ref: 'User',
                },
            ],
        },
        edited: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
