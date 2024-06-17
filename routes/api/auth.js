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

    User.findOne({email: req.body.email})
        .then(user => {
            if(user) {
                errors.email = 'Email already exists';
                return res.status(400).json({errors});

            } else {
                // const avatar = gravatar
                const newUser = new User({
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password,
                    avatar: req.protocol + '://' + req.get('host') + '/images/user_placeholder.png',
                    date: Date.now()
                });


                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => {
                                console.log('#here');
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
                            .catch(err => console.log(err));
                    });
                });
            }
        })
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