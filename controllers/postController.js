const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');
const createError = require('../utils/error');

// CREATE A POST
const createPost = async (req, res, next) => {
    const currentUser = await User.findOne({ _id: req.user.userId });

    try {
        const newPost = new Post({
            ...req.body,
            user: req.user.userId,
            authorName: currentUser.username,
        });
        const post = await newPost.save();
        res.status(201).json(post);
    } catch(error) {
        next(500, 'Error in server.');
    }
};

// GET A POST
const getPost = async (req, res, next) => {
    try {
        const currentUser = await User.findOne({ _id: req.user.userId });

        const post = await Post.findOne({ _id: req.params.id })
            .populate('user', 'username profilePicture')
            .lean();

        if (post) {
            if (post.privacy === 'friends') {
                const postAuthor = await User.findOne({ _id: post.user });
                if (
                    currentUser.friends.includes(postAuthor._id) ||
                    postAuthor._id.valueOf() === currentUser._id.valueOf()
                ) {
                    return res.status(200).json(post);
                }
                return next(createError(404, 'Post not available.'));
            }
            return res.status(200).json(post);
        }
        next(createError(404, 'Post not found.'));
    } catch (err) {
        next(createError(500, 'Error in server.'));
    }
};

// GET A CERTAIN USER POSTS
const getProfilePosts = async (req, res, next) => {
    try {
        const currentUser = await User.findOne({ _id: req.user.userId });

        const user = await User.findOne({ _id: req.params.profileUserId });
        if (user) {
            if (
                currentUser.friends.includes(user._id) ||
                currentUser._id.valueOf() === user._id.valueOf()
            ) {
                const posts = await Post.find({ user: mongoose.Types.ObjectId(user._id) }).populate(
                    'user',
                    'username profilePicture'
                );
                res.status(200).json(posts);
            } else {
                const posts = await Post.find({
                    user: mongoose.Types.ObjectId(user._id),
                    privacy: 'public',
                }).populate('user', 'username profilePicture');
                res.status(200).json(posts);
            }
        } else {
            res.status(404, 'User not found');
        }
    } catch (err) {
        next(createError(500, 'Error in server'));
    }
};

// GET CURRENT USER'S TIMELINE POSTS
const getTimelinePosts = async (req, res, next) => {
    try {
        const currentUser = await User.findOne({ _id: req.user.userId });
        const userPosts = await Post.find({ user: req.user.userId }).populate(
            'user',
            'username profilePicture'
        ).populate('comments');
        const friendPosts = await Promise.all(
            currentUser.friends.map((friendId) =>
                Post.find({
                    user: friendId,
                    $or: [{ privacy: 'public' }, { privacy: 'friends' }],
                }).populate('user', 'username profilePicture').populate('comments')
            )
        );
        return res.status(200).json(userPosts.concat(...friendPosts));
    } catch (err) {
        next(createError(500, 'Error in server.'));
    }
};

// UPDATE A POST
const updatePost = async (req, res, next) => {
    try {
        const post = await Post.findOne({ _id: req.params.id });

        if (req.user.userId === post.user.valueOf()) {
            const updatedPost = await post.updateOne({ $set: req.body });
            res.status(200).json('The post has been updated.');
        } else {
            next(createError(401, "You don't have permission to update this post."));
        }
    } catch {
        next(createError(500, 'Error in server.'));
    }
};

// DELETE A POST
const deletePost = async (req, res, next) => {
    try {
        const post = await Post.findOne({ _id: req.params.id });
        if (req.user.userId === post.user.valueOf()) {
            await Post.deleteOne({ _id: req.params.id });
            res.status(200).json('Your post has been deleted.');
            res.send('hello');
        } else {
            next(401, "You don't have permission to delete this post.");
        }
    } catch (err) {
        next(500, 'Error in server.');
    }
};

// LIKE OR UNLIKE A POST
const likeOrUnlike = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post) {
            if (post.dislikes.includes(req.user.userId)) {
                await post.updateOne({ $pull: { dislikes: req.user.userId } });
            }
            if (!post.likes.includes(req.user.userId)) {
                await post.updateOne({ $push: { likes: req.user.userId } });
                res.status(200).json('You liked this post.');
            } else {
                await post.updateOne({ $pull: { likes: req.user.userId } });
                res.status(200).json('You unliked this post.');
            }
        } else {
            next(createError(404, 'Post not found.'));
        }
    } catch (err) {
        next(createError(500, 'Error in server.'));
    }
};

const dislikeOrUndislike = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if (post) {
            if (post.likes.includes(req.user.userId)) {
                await post.updateOne({ $pull: { likes: req.user.userId } });
            }
            if (!post.dislikes.includes(req.user.userId)) {
                await post.updateOne({ $push: { dislikes: req.user.userId } });
                res.status(200).json('You disliked this post.');
            } else {
                await post.updateOne({ $pull: { dislikes: req.user.userId } });
                res.status(200).json('You undisliked this post.');
            }
        } else {
            next(createError(404, 'Post not found.'));
        }
    } catch (err) {
        next(createError(500, 'Error in server.'));
    }
};

const setPrivacy = async (req, res, next) => {
    try {
        const privacy =
            req.body.privacy === 'public' || req.body.privacy === 'friends'
                ? req.body.privacy
                : null;

        const post = await Post.findOne({ _id: req.params.id });

        if (post) {
            if (post.user.valueOf() !== req.user.userId) {
                return next(createError(401, "You don't have permission."));
            }
            if (privacy) {
                await post.updateOne({ $set: { privacy: req.body.privacy } });
                res.status(200).json('Privacy updated successfuly.');
            } else {
                res.status(400).json('Bad request.');
            }
        } else {
            return next(createError(404, 'Post not found.'));
        }
    } catch (err) {
        next(createError(500, 'Error in server'));
    }
};

module.exports = {
    createPost,
    getPost,
    updatePost,
    deletePost,
    likeOrUnlike,
    dislikeOrUndislike,
    getTimelinePosts,
    getProfilePosts,
    setPrivacy,
};
