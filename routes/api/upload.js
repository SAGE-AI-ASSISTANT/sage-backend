const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const dotenv = require('dotenv');
const uploadFiles = require('../../middlewares/upload');
const { getServerAddress } = require('../../utils/util');
dotenv.config();





// @route   GET api/upload/test
// @desc    Tests users route
// @access  public
router.get('/test', passport.authenticate('jwt', { session: false }), (req, res) => res.json({msg: 'Auth Works!'}));

// @route   GET api/upload/doc
// @desc    Tests users route
// @access  public
router.post('/doc', passport.authenticate('jwt', { session: false }), (req, res, ) => {
    uploadFiles(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message })
        }

        return res.json({message: 'File Uploaded', files: req.files.map(file => file.path )})

    })
            

});







module.exports = router;