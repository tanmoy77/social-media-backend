const express = require('express');
const { register, login, checkLogin } = require('../controllers/authController');
const { verfiyToken, verifyToken } = require('../utils/verify');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/checklogin', verifyToken, checkLogin);

module.exports = router;
