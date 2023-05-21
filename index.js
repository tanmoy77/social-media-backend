const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const logger = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoute = require('./routes/userRoute');
const authRoute = require('./routes/authRoute');
const postRoute = require('./routes/postRoute');
const conversationRoute = require('./routes/conversationRoute');
const messageRoute = require('./routes/messageRoute');
const commentRoute = require('./routes/commentRoute');
const searchRoute = require('./routes/searchRoute');

const app = express();
dotenv.config();

// mongodb connection
const connect = async () => {
    try{
        await mongoose.connect(process.env.MONGO);
        console.log('mongoose connected');
    } catch(err){
        console.log(err)
    }
    
};

// middlewares
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(logger('dev'));

// routes
app.use('/api/users', userRoute);
app.use('/api/auth', authRoute);
app.use('/api/posts', postRoute);
app.use('/api/search', searchRoute);
app.use('/api/comments', commentRoute);
app.use('/api/conversation', conversationRoute);
app.use('/api/message', messageRoute);

app.use((err, req, res, next) => {
    const errorStatus = err.status || 500;
    const errorMessage = err.message || 'something went wrong';

    return res.status(errorStatus).json({
        success: false,
        status: errorStatus,
        message: errorMessage,
        stack: err.stack,
    });
});

app.listen(process.env.PORT, () => {
    connect();
    console.log(`server is running on port: ${process.env.PORT}`);
});
