const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        authorName: {
            type: String,
            required: true,
        },
        desc: {
            type: String,
            max: 500,
        },
        img: {
            type: String,
        },
        privacy: {
            type: String,
            enum: ['public', 'friends'],
            default: 'public',
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
        comments: {
            type: [
                {
                    type: mongoose.Types.ObjectId,
                    ref: 'Comment',
                },
            ],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
