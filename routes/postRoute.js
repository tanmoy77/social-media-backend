const express = require('express');
const { verifyToken } = require('../utils/verify');
const {
    createPost,
    getPost,
    deletePost,
    updatePost,
    likeOrUnlike,
    dislikeOrUndislike,
    getTimelinePosts,
    getProfilePosts,
    setPrivacy,
} = require('../controllers/postController');

const router = express.Router();

router.post('/create', verifyToken, createPost);
router.get('/timeline', verifyToken, getTimelinePosts);
router.get('/profile/:profileUserId', verifyToken, getProfilePosts);
router.get('/:id', verifyToken, getPost);
router.delete('/:id', verifyToken, deletePost);
router.put('/:id', verifyToken, updatePost);
router.put('/:id/like', verifyToken, likeOrUnlike);
router.put('/:id/dislike', verifyToken, dislikeOrUndislike);
router.put('/:id/updatePrivacy', verifyToken, setPrivacy);

module.exports = router;
