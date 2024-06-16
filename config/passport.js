const jwt = require('jsonwebtoken');
const {Strategy:JwtStrategy, ExtractJwt} = require('passport-jwt');
const {Strategy: GoogleStrategy} = require('passport-google-oauth2');
const mongoose = require('mongoose');
const User = mongoose.model('users');


const dotenv = require('dotenv');
dotenv.config();

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWTKey;

module.exports = passport => {
    passport.serializeUser( (user, cb) => {
      cb(null, user);
    })

    passport.deserializeUser( (user, cb) => {
      cb(null, user);
    })

    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        User.findById(jwt_payload.id)
            .then(user => {
                if(user) {
                  return done(null, user);
                }
                return done(null, false);
            })
            .catch(err => console.log(err));
    }));


  // PASSPORT GoogleStrategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
        passReqToCallback   : true
    },
    function(request, accessToken, refreshToken, profile, done) {
      User.findOne( {googleId: profile.id}, function (err, user) {
        if(user){
          const payload = { id: user.id, name: user.name, avatar: user.avatar };
          // Sign the Token
          // expires in one week
          jwt.sign(payload, process.env.JWTKey, {expiresIn: 604800}, (err, token) => {
              user.token = 'Bearer ' + token
              return done(err, user);
          });
        } else {
          var newUser = new User();
          newUser.name  = profile.displayName;
          newUser.avatar = profile.picture;
          newUser.googleId = profile.id;
          newUser.email = profile.email[0];
          newUser.save()
            .then(user => {
                const payload = { id: user.id, name: user.name, avatar: user.avatar };
                // Sign the Token
                // expires in one week
                jwt.sign(payload, process.env.JWTKey, {expiresIn: 604800}, (err, token) => {
                    user.token = 'Bearer ' + token
                    return done(err, user);
                });
            })
          }
      });
    }
  ));
}