const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');
const Post = require('../models/Post');
const createError = require('../utils/error');

// GET A USER
const getUser = async (req, res, next) => {
    const { userId, username } = req.query;

    try {
        const user = userId
            ? await User.findOne({_id: userId})
            : await User.findOne({ username: { $regex: new RegExp(username, 'i') } });
        if (user) {
            const { password, isAdmin, updatedAt, ...other } = user._doc;
            res.status(200).json(other);
        } else {
            next(createError(404, 'User not found'));
        }
    } catch (err) {
        next(createError(500, 'Error in server.'));
    }
};

// UPDATE A USER
const updateUser = async (req, res, next) => {
    try {
        const user = await User.findOneAndUpdate(
            { _id: req.params.id },
            {
                $set: req.body,
            },
            { new: true }
        );
        if (user) {
            res.status(200).json(user);
        } else {
            next(createError(400, 'Bad Request.'));
        }
    } catch (err) {
        next(createError(500, 'something went wrong'));
    }
};

// Delete A USER
const deleteUser = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.params.id);
        const posts = await Post.deleteMany({ user: currentUser._id });
        await Promise.all(
            currentUser.friends.map((friendId) =>
                User.findOneAndUpdate({ _id: friendId }, { $pull: { friends: currentUser._id } })
            )
        );
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json('Account has been deleted successfully.');
    } catch (err) {
        // next(createError(500, 'something went wrong'));
        console.log(err);
    }
};

// Send FRIEND REQUEST
const sendFriendRequest = async (req, res, next) => {
    const { userId } = req.user;
    const { recipientId } = req.body;

    try {
        const foundFriendRequest = await FriendRequest.findOne({
            sender: userId || recipientId,
            recipient: recipientId || userId,
        });

        if (foundFriendRequest) {
            return next(createError(400, 'Unable to send friend request to this user.'));
        }

        const newFriendRequest = new FriendRequest({
            sender: userId,
            recipient: recipientId,
            status: 'pending',
        });

        await newFriendRequest.save();

        return res.status(200).json('Friend request sent.');
    } catch (err) {
        next(createError(500, 'something went wrong.'));
    }
};

// GET FRIEND REQUESTS OF CURRENT USER
const getFriendRequests = async (req, res, next) => {
    try {
        const requests = await FriendRequest.find({
            recipient: req.user.userId,
            status: 'pending',
        });
        res.status(200).json(requests);
    } catch (err) {
        next(createError(500, 'something went wrong.'));
    }
};

// GET A SINGLE FRIEND REQUEST BY ID, RETURNS TRUE OR FALSE
// DETERMINES IF CURRENT USER HAS PENDING OR EXISTING
// FRIEND REQUEST WITH THIS OWNER OF PROFILE OR BEING VIEWED
const checkFriendRequestStatus = async (req, res, next) => {
    const { profileUserId } = req.query;
    const { userId } = req.user;

    try {
        const foundSentFriendRequest = await FriendRequest.findOne({
            sender: userId,
            recipient: profileUserId,
        });

        const foundReceivedFriendRequest = await FriendRequest.findOne({
            sender: profileUserId,
            recipient: userId,
        });

        if (foundSentFriendRequest) {
            return res.json({
                status: 'hanging',
                friendRequestObject: foundSentFriendRequest,
            });
        }
        if (foundReceivedFriendRequest) {
            return res.json({
                status: 'pending',
                friendRequestObject: foundReceivedFriendRequest,
            });
        }
        res.json({
            status: false,
        });
    } catch (err) {
        // next(createError(500, 'something went wrong.'));
        console.log(err);
    }
};

// ACCEPT FRIEND REQUEST
const acceptFriendRequest = async (req, res, next) => {
    const recipientId = req.user.userId;
    const senderId = req.body.sender;

    try {
        const updatedSender = await User.findOneAndUpdate(
            { _id: senderId, friends: { $nin: [recipientId] } },
            { $push: { friends: recipientId } },
            { new: true }
        );

        const updatedRecipient = await User.findOneAndUpdate(
            {
                _id: recipientId,
                friends: { $nin: [senderId] },
            },
            { $push: { friends: senderId } },
            { new: true }
        );

        if (updatedRecipient) {
            const updatedFriendRequest = await FriendRequest.findOneAndUpdate(
                {
                    sender: senderId,
                    recipient: recipientId,
                },
                {
                    $set: { status: 'accepted' },
                    $push: { friendshipParticipants: [senderId, recipientId] },
                },
                { new: true }
            );

            const updatedRequests = await FriendRequest.find({
                recipient: req.user.userId,
                status: 'pending',
            });
            res.status(200).json({
                updatedRequests,
                updatedUserFriendList: updatedRecipient.friends,
            });
        }
    } catch {
        next(createError(500, 'Error in server.'));
    }
};

// REJECT FRIEND REQUESTS
const rejectFriendRequest = async (req, res, next) => {
    const recipientId = req.user.userId;
    const senderId = req.body.sender;

    try {
        const deletedFriendRequest = await FriendRequest.findOneAndDelete({
            sender: senderId,
            recipient: recipientId,
        });

        const updatedRequests = await FriendRequest.find({
            recipient: req.user.userId,
            status: 'pending',
        });

        res.status(200).json({ updatedRequests });
    } catch (err) {
        next(createError(500, 'Error in server.'));
    }
};

// CANCEL FRIEND REQUEST
const cancelFriendRequest = async (req, res, next) => {
    const senderId = req.user.userId;
    const recipientId = req.body.recipientId;

    try {
        const canceledFriendRequest = await FriendRequest.findOneAndDelete({
            sender: senderId,
            recipient: recipientId,
        });

        res.status(200).json('Canceled request.');
    } catch (err) {
        next(createError(500, 'Error in server'));
    }
};

// UNFRIEND
const unfriend = async (req, res, next) => {
    const { userId } = req.user;
    const { friendId } = req.body;

    const updatedUser = await User.findOneAndUpdate(
        {
            _id: userId,
        },
        { $pullAll: { friends: [friendId] } },
        { new: true }
    ).select('-password');

    const updatedFriend = await User.findOneAndUpdate(
        {
            _id: friendId,
        },
        { $pullAll: { friends: [userId] } },
        { new: true }
    ).select('-password');

    const deletedFriendRequest = await FriendRequest.findOneAndDelete({
        $and: [
            { friendshipPaticipants: { $in: [friendId] } },
            { friendshipParticipants: { $in: [userId] } },
        ],
    });

    res.status(200).send({ updatedUser, updatedFriend });
};

module.exports = {
    getUser,
    updateUser,
    deleteUser,
    sendFriendRequest,
    getFriendRequests,
    checkFriendRequestStatus,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    unfriend,
};
