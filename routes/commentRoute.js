const express = require('express');
const {
    createComment,
    getComments,
    updateComment,
    deleteComment,
    likeOrUnlikeComment,
    dislikeOrUndislikeComment,
} = require('../controllers/commnetController');
const { verifyToken } = require('../utils/verify');

const router = express.Router();

router.post('/create/:id', verifyToken, createComment);
router.put('/like/:commentId', verifyToken, likeOrUnlikeComment);
router.put('/dislike/:commentId', verifyToken, dislikeOrUndislikeComment);
router.put('/:commentId', verifyToken, updateComment);
router.delete('/:commentId', verifyToken, deleteComment);
router.get('/:postId', verifyToken, getComments);

module.exports = router;
