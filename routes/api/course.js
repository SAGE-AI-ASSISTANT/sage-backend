const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const dotenv = require('dotenv');
const Course = require('../../models/Course');
const uploadFiles = require('../../middlewares/upload');
const { getServerAddress } = require('../../utils/util');
const validateCourseInput = require('../../validation/course');
dotenv.config();




// @route   GET api/course/test
// @desc    Tests course route
// @access  public
router.get('/test', passport.authenticate('jwt', { session: false }), (req, res) => res.json({msg: 'Course Works!'}));

// @route   GET api/course/list
// @desc    Tests courses created by a user
// @access  public
router.get('/list', passport.authenticate('jwt', { session: false }), (req, res, ) => {
    const userID = req.user.id;
    Course.find({creator: userID}).populate('chats').sort({ createdAt: -1 }).then(courses => {
        return res.status(200).json({message: 'success', courses})
    }).catch(error => res.status(400).json({error: error.message}))
})

// @route   GET api/course/new
// @desc    Create a new course
// @access  public
router.post('/new', passport.authenticate('jwt', { session: false }), (req, res, ) => {
    // check for the course using the id passed and then fetch the txt content of the files uploaded then parse it, and send it as a command to the user
    uploadFiles(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message })
        }

        const {errors, isValid} = validateCourseInput({...req.body, files: req.files})
        if(!isValid){
            return res.status(400).json({errors})
        }

        const newCourse = new Course({
            title: req.body.title,
            description: req.body.description,
            creator: req.user.id,
            files: req.files,
            date: Date.now()
        });
    
        newCourse.save().then(course => {
            return res.json({message: 'success', course})
        }).catch(error => {
            if (error.code === 11000) {
                // Handle duplicate key error
                if (error.keyPattern.title) {
                    return res.status(400).json({ errors: {title: 'Course Title already exists'} });
                } else {
                    return res.status(400).json({ error: 'Duplicate key error' });
                }
            } else {
                return res.status(500).json({ error: error.message });
            }
        });


    })

    

});

// @route   DELETE api/course/delete
// @desc    Delete a Course
// @access  public
router.delete('/delete/:id', passport.authenticate('jwt', { session: false }), async (req, res, ) => {
    const { id } = req.params;
    try {
        //handle deleting of chats linked
        const result = await Course.findOneAndDelete({ _id: id, creator: req.user.id });
        if (result) {
            res.status(200).json({ message: `success`, id});
        } else {
            res.status(404).json({ error: `Item not found` });
        }
    } catch (error) {
        res.status(500).json({ error: `Error deleting item` });
    }

})







module.exports = router;