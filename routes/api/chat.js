const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const dotenv = require('dotenv');
const Course = require('../../models/Course');
const Chat = require('../../models/Chat');
const User = require('../../models/User');
const uploadFiles = require('../../middlewares/upload');
const { getServerAddress } = require('../../utils/util');
const validateChatInput = require('../../validation/chat');
const {getGroqChatCompletion} = require("../../config/groq")
const { default: mongoose } = require('mongoose');
dotenv.config();


// @route   GET api/chat/test
// @desc    Tests course route
// @access  public
router.get('/test', passport.authenticate('jwt', { session: false }), (req, res) => res.json({msg: 'Chat Works!'}));

// @route   GET api/chat/list
// @desc    returns Chats under a course id
// @access  public
router.get('/list/:courseID', passport.authenticate('jwt', { session: false }), (req, res, ) => {
    const userID = req.user.id;
    const {courseID} = req.params

    Chat.find({course: courseID, creator: userID}).sort({ createdAt: -1 }).then(chats => {
        return res.status(200).json({message: 'success', chats})
    }).catch(error => res.status(400).json({error: error.message}))
})

// @route   POST api/chat/new
// @desc    Create a new CHat
// @access  public
router.post('/new', passport.authenticate('jwt', { session: false }), async (req, res, ) => {

    const {errors, isValid} = validateChatInput(req.body)
    if(!isValid){
        return res.status(400).json({errors})
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const user = await User.findById(req.body.creator).session(session);
        if (!user) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: 'User not found' });
        }

        const course = await Course.findById(req.body.course).session(session);
        if(!course){
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: 'Course not found' });
        }

        const newChat = new Chat({
            title: course.title + Date.now(),
            creator: req.user.id,
            course: req.body.course,
            messages: req.body.messages
        });
        const savedChat = await newChat.save({session});

        
        course.chats.push(savedChat._id);
        await course.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(400).json({message: 'success', chat: savedChat})
    } catch(error){
        if (error.code === 11000) {
            // Handle duplicate key error
            if (error.keyPattern.course) {
                return res.status(400).json({ errors: {course: 'Course not found'} });
            } else if (error.keyPattern.creator) {
                return res.status(400).json({ errors: {creator: 'Creator not found'} });
            } else {
                return res.status(400).json({ error: 'Duplicate key error' });
            }
        } else {
            return res.status(500).json({ error: error.message });
        }
    }


    
});

// @route   DELETE api/chat/delete
// @desc    Delete a Chat
// @access  public
router.delete('/delete/:id', passport.authenticate('jwt', { session: false }), async (req, res, ) => {
    const { id } = req.params;
    try {
        //handle deleting of chats linked
        console.log(id, req.user.id);
        const result = await Chat.findOneAndDelete({ _id: id, creator: req.user.id });
        if (result) {
            res.status(200).json({ message: `success`, id});
        } else {
            res.status(404).json({ error: `Item not found` });
        }
    } catch (error) {
        res.status(500).json({ error: `Error deleting item` });
    }

})

router.post('/send', passport.authenticate('jwt', { session: false }), async (req, res, ) => {
    const {messages} = req.body;
    try {
        const data = await getGroqChatCompletion(messages);
        return res.status(200).json(data)

    } catch(error){
        return res.status(400).json({error: error.message})
    }
    
})







module.exports = router;