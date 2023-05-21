const express = require('express');
const { verifyToken } = require('../utils/verify');
const search = require('../controllers/searchController');

const router = express.Router();

router.get('/', verifyToken, search); // query key=search

module.exports = router;
