const express = require('express');
const { verifyToken, verifyUser, verifyAdmin } = require('../utils/verify');
const {
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
} = require('../controllers/userController');

const router = express.Router();

router.get('/', verifyToken, getUser);
router.put('/:id', verifyToken, verifyUser, updateUser);
router.delete('/:id', verifyToken, verifyUser, deleteUser);
router.post('/sendFriendRequest', verifyToken, sendFriendRequest);
router.get('/getFriendRequests', verifyToken, getFriendRequests);
router.get('/checkFriendReqStatus', verifyToken, checkFriendRequestStatus);
router.post('/acceptFriendRequest', verifyToken, acceptFriendRequest);
router.post('/rejectFriendRequest', verifyToken, rejectFriendRequest);
router.post('/cancelFriendRequest', verifyToken, cancelFriendRequest);
router.post('/unfriend', verifyToken, unfriend);

module.exports = router;
