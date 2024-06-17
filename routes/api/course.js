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
router.get('/test', passport.authenticate('jwt', { session: false }), (req, res) => res.json({msg: 'Auth Works!'}));

// @route   GET api/course/create
// @desc    Tests users route
// @access  public
router.post('/new', passport.authenticate('jwt', { session: false }), (req, res, ) => {
    const {errors, isValid} = validateCourseInput(req.body)
    if(!isValid){
        return res.status(400).json({errors})
    }

    const newCourse = new Course({
        title: req.body.title,
        description: req.body.description,
        creator: req.user.id,
        files: req.body.files,
        date: Date.now()
    });

    newCourse.save().then(course => {
        return res.json({message: 'success', course})
    }).catch(error => res.status(400).json({error: error.message}))

});







module.exports = router;