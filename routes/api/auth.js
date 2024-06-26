const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const dotenv = require('dotenv');
dotenv.config();

// Load Input Validation
const validateRegisterInput = require('../../validation/register')
const validateLoginInput = require('../../validation/login')


// Load User Model
const User = require('../../models/User');
const { getServerAddress } = require('../../utils/util');



// @route   GET api/auth/test
// @desc    Tests users route
// @access  public
router.get('/test', (req, res) => res.json({msg: 'Auth Works!'}));


// @route   POST api/auth/register
// @desc    Register User
// @access  public
router.post('/register', (req, res) => {
    // Validate the inputs
    const {errors, isValid} = validateRegisterInput(req.body);
    // Check Validation Errors

    if (!isValid) {
        return res.status(400).json({errors});
    }

    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        avatar: getServerAddress(req) + '/images/user_placeholder.png',
        date: Date.now()
    });

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if(err) throw err;
            newUser.password = hash;
            newUser.save()
                .then(user => {
                    const payload = { id: user.id, username: user.username, avatar: user.avatar, email: user.email };
                    // Sign the Token
                    // expires in one week
                    jwt.sign(payload, process.env.JWTKey, {expiresIn: 604800}, (err, token) => {
                        
                        return res.json({
                            reply: 'Success',
                            token: 'Bearer ' + token,
                            user: payload
                        })
                    });
                })
                .catch(error => {
                    if (error.code === 11000) {
                        // Handle duplicate key error
                        if (error.keyPattern.email) {
                            return res.status(400).json({ errors: {email: 'Email already exists'} });
                        } else if (error.keyPattern.username) {
                            return res.status(400).json({ errors: {username: 'Username already exists'} });
                        } else {
                            return res.status(400).json({ error: 'Duplicate key error' });
                        }
                    } else {
                        return res.status(500).json({ error: error.message });
                    }
                });
        });
    });
});

// @route   POST api/auth/login
// @desc    Login User / Return JWT Token
// @access  public
router.post('/login', (req, res) => {
    // Validate the inputs
    const {errors, isValid} = validateLoginInput(req.body);
    // Check Validation Errors
    if (!isValid) {
        return res.status(400).json({errors}); 
    }

    const {email, password} = req.body;

    // Find user by email
    User.findOne({email})
        .then(user => {
            // check for user
            if (!user) {
                errors.email = 'Email not found';
                return res.status(404).json({errors});
            }

            //check Password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {
                        // User Matched
                        // Create the payload
                        const payload = { id: user.id, username: user.username, avatar: user.avatar, email: user.email };
                        // Sign the Token
                        // expires in one week
                        jwt.sign(payload, process.env.JWTKey, {expiresIn: 604800}, (err, token) => {
                            res.json({
                                reply: 'Success',
                                token: 'Bearer ' + token,
                                user: payload
                            })
                        });
                    } else {
                        errors.password = 'Password not correct';
                        return res.status(400).json({errors});
                    }
                })
                .catch(err => console.log(err));
        })
})

router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));
  
  router.get( '/google/callback',
      passport.authenticate( 'google', {
          successRedirect: '/auth/google/success',
          failureRedirect: '/auth/google/failure'
  }));



module.exports = router;