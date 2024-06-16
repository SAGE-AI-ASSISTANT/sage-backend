const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const dotenv = require('dotenv');
dotenv.config();





// @route   GET api/auth/test
// @desc    Tests users route
// @access  public
router.get('/test', passport.authenticate('jwt', { session: false }), (req, res) => res.json({msg: 'Auth Works!'}));





module.exports = router;