const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const dotenv = require('dotenv');
const upload = require('../../middlewares/upload');
dotenv.config();





// @route   GET api/upload/test
// @desc    Tests users route
// @access  public
router.get('/test', passport.authenticate('jwt', { session: false }), (req, res) => res.json({msg: 'Auth Works!'}));

// @route   GET api/upload/test
// @desc    Tests users route
// @access  public
router.post('/doc', 
    passport.authenticate('jwt', { session: false }), 
    upload.array('files'), 
    (req, res) => {
        console.log(req.files);
        res.json({msg: 'File Uploaded'})

});







module.exports = router;