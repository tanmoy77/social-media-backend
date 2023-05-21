const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const createError = require('../utils/error');

// CREATE A COMMENT
const createComment = async (req, res, next) => {
    try {
        const post = await Post.findOne({ _id: req.params.id });
        const currentUser = await User.findOne({ _id: req.user.userId });

        if (post) {
            const postAuthor = await User.findOne({ _id: post.user });
            if (post.privacy === 'friends') {
                if (
                    currentUser.friends.includes(postAuthor._id) ||
                    currentUser._id.valueOf() === postAuthor._id.valueOf()
                ) {
                    const comment = new Comment({
                        ...req.body,
                        user: req.user.userId,
                        postId: post._id,
                        postAuthorId: postAuthor._id,
                    });
                    await comment.save();
                    await Post.findOneAndUpdate(
                        { _id: req.params.id },
                        { $push: { comments: comment._id } }
                    );
                    return res.status(201).json(comment);
                }
                return next(createError(400, 'Bad Request.'));
            }
            const comment = new Comment({ ...req.body, user: req.user.userId, postId: post._id, postAuthorId: postAuthor._id });
            await comment.save();
            await Post.findOneAndUpdate(
                { _id: req.params.id },
                { $push: { comments: comment._id } }
            );
            return res.status(201).json(comment);
        }
        next(createError(404, 'Post not found.'));
    } catch (err) {
        console.log(err)
        next(createError(500, 'Error in server.'));
    }
};

// GET ALL COMMENTS OF A POST
const getComments = async (req, res, next) => {
    try {
        const comments = await Comment.find({ postId: req.params.postId })
            .populate('user', 'username profilePicture')
            .sort({ createdAt: -1 });

        res.status(200).json(comments);
    } catch (err) {
        next(createError, 'Error in server.');
    }
};

// UPDATE A COMMENT
const updateComment = async (req, res, next) => {
    try {
        const comment = await Comment.findOne({ _id: req.params.commentId });

        if (comment) {
            if (comment.user.valueOf() === req.user.userId) {
                await comment.updateOne({ $set: { text: req.body.text, edited: true } });
                res.status(200).json('updated successfully.');
            } else {
                return next(createError(403, "You don't have permission."));
            }
        } else {
            return next(createError(404, 'Comment not Found.'));
        }
    } catch (err) {
        next(createError(500, 'Error in server'));
    }
};

// DELETE A COMMENT
const deleteComment = async (req, res, next) => {
    try {
        const comment = await Comment.findOne({ _id: req.params.commentId });
        const post = await Post.findOne({ _id: comment.postId });

        if (comment) {
            if (
                comment.user.valueOf() === req.user.userId ||
                post.user.valueOf() === req.user.userId
            ) {
                await comment.deleteOne();
                await post.updateOne({$pull: {comments: comment._id}})
                res.status(200).json('deleted successfully.');
            } else {
                return next(createError(403, "You don't have permission."));
            }
        } else {
            return next(createError(404, 'Comment not Found.'));
        }
    } catch (err) {
        next(createError(500, 'Error in server'));
    }
};

// Like a comment
const likeOrUnlikeComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (comment) {
            if (comment.dislikes.includes(req.user.userId)) {
                await comment.updateOne({ $pull: { dislikes: req.user.userId } });
            }
            if (!comment.likes.includes(req.user.userId)) {
                await comment.updateOne({ $push: { likes: req.user.userId } });
                res.status(200).json('You liked this comment.');
            } else {
                await comment.updateOne({ $pull: { likes: req.user.userId } });
                res.status(200).json('You unliked this comment.');
            }
        } else {
            next(createError(404, 'Comment not found.'));
        }
    } catch (err) {
        next(createError(500, 'Error in server.'));
    }
};

// Dislike or Undislike a comment
const dislikeOrUndislikeComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (comment) {
            if (comment.likes.includes(req.user.userId)) {
                await comment.updateOne({ $pull: { likes: req.user.userId } });
            }
            if (!comment.dislikes.includes(req.user.userId)) {
                await comment.updateOne({ $push: { dislikes: req.user.userId } });
                res.status(200).json('You disliked this comment.');
            } else {
                await comment.updateOne({ $pull: { dislikes: req.user.userId } });
                res.status(200).json('You undisliked this comment.');
            }
        } else {
            next(createError(404, 'Comment not found.'));
        }
    } catch (err) {
        next(createError(500, 'Error in server.'));
    }
};

module.exports = {
    createComment,
    getComments,
    updateComment,
    deleteComment,
    likeOrUnlikeComment,
    dislikeOrUndislikeComment,
};
