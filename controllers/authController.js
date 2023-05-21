const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const createError = require('../utils/error');

const register = async (req, res, next) => {
    const username = typeof req.body.username === 'string' ? req.body.username : null;
    const email = typeof req.body.email === 'string' ? req.body.email : null;
    const password = typeof req.body.password === 'string' ? req.body.password : null;

    if (username && email && password) {
        if (username.length >= 3 && username.length <= 20) {
            if (password.length >= 6) {
                const user = await User.findOne({
                    username: { $regex: new RegExp(username.toLowerCase(), 'i') },
                });

                const userEmail = await User.findOne({
                    email: { $regex: new RegExp(email.toLowerCase(), 'i') },
                });
                if (userEmail) {
                    return next(
                        createError(400, 'User with this email already exists. Use another.')
                    );
                }
                if (!user) {
                    try {
                        const hashPassword = await bcrypt.hash(password, 10);
                        const newUser = new User({ username, email, password: hashPassword });

                        await newUser.save();
                        res.status(201).json('User registration successful.');
                    } catch (err) {
                        next(createError(500, 'Error in server'));
                    }
                } else {
                    next(createError(400, 'User already exists with this username. Try another.'));
                }
            } else {
                next(createError(400, 'Password length must be at least 6 characters long.'));
            }
        } else {
            next(createError(400, 'Username must be between 3 and 20 characters.'));
        }
    } else {
        next(createError(400, 'Some fields are missing.'));
    }
};

const login = async (req, res, next) => {
    const usernameOrEmail =
        typeof req.body.usernameOrEmail === 'string'
            ? req.body.usernameOrEmail.toLowerCase()
            : null;
    const userPassword = typeof req.body.password === 'string' ? req.body.password : null;

    try {
        const user = await User.findOne({
            $or: [
                {
                    email: usernameOrEmail 
                },
                {
                    username: usernameOrEmail,
                },
            ],
        })
        if (user) {
            const isValidPassword = await bcrypt.compare(userPassword, user.password);
            if (isValidPassword) {
                const accessToken = jwt.sign(
                    { username: user.username, userId: user._id, isAdmin: user.isAdmin },
                    process.env.JWT
                );

                const { password, isAdmin, ...otherDetails } = user._doc;
                res.cookie('access_token', accessToken, { httpOnly: true })
                    .status(200)
                    .json({ details: { ...otherDetails }, isAdmin });
            } else {
                next(createError(400, 'Wrong username or password.'));
            }
        } else {
            next(createError(400, 'Wrong username or password.'));
        }
    } catch (err) {
        console.log(err)
        next(createError(500, 'Error in server.'));
    }
};

const checkLogin = async (req, res, next) => {
    try {
        res.send('you are logged in.')
    } catch(err) {
        next(createError(500, 'Error in server.'))
    }
}

module.exports = {
    register,
    login,
    checkLogin
};
