const jwt = require('jsonwebtoken');
const createError = require('./error');
const User = require('../models/User');

const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token;

    if (!token) {
        next(createError(400, 'You are not authorized!'));
    }
    jwt.verify(token, process.env.JWT, async (err, user) => {
        if (err) {
            next(createError(403, 'token is not valid!'));
        }

        req.user = user;
        const currentUser = await User.findOne({ _id: req.user?.userId });
        if (currentUser === null) {
            return next(createError(403, 'You are not authorized.'));
        }
        next();
    });
};

const verifyUser = (req, res, next) => {
    verifyToken(req, res, next, () => {
        if (req.user.userId === req.params.id || req.user.isAdmin) {
            next();
        } else {
            next(createError(403, 'You are not authorized!'));
        }
    });
};

const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, next, () => {
        if (req.user.isAdmin) {
            next();
        } else {
            next(createError(403, 'You are not authorized!'));
        }
    });
};

module.exports = {
    verifyToken,
    verifyUser,
    verifyAdmin,
};
