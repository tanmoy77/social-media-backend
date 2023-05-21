const Post = require('../models/Post');
const User = require('../models/User');
const createError = require('../utils/error');

const search = async (req, res, next) => {
    const searchTerm = req.query.search;

    try {
        if (searchTerm === ''){
            return res.status(200).json([])
        }
        const users = await User.find({ username: { $regex: new RegExp(searchTerm, 'i') } }).select(
            'username profilePicture'
        );

        // const posts = await Post.find({
        //     privacy: 'public',
        //     $or: [
        //         { desc: { $regex: new RegExp(searchTerm, 'i') } },
        //         { authorName: { $regex: new RegExp(searchTerm, 'i') } },
        //     ],
        // })
        //     .populate('user', 'username profilePicture')
        //     .select('-_v');

        res.status(200).json({ users });
    } catch (err) {
        next(createError(500, 'something went wrong'));
    }
};

module.exports = search;
