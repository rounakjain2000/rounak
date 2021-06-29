const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
// Load User model
const User = require('../server/model/user');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'userid' }, (userid, password, done) => {
      // Match user
      User.findOne({
        userid: userid
      }).then(user => {
          console.log(user);
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
        //   if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.userid);
  });

  passport.deserializeUser(function(userid, done) {
    User.findById(userid, function(err, user) {
      done(err, user);
    });
  });
};