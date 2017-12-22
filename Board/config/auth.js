var LocalStrategy = require('passport-local').Strategy,
    User = require('../models/User');

    module.exports = function(passport) {
        passport.serializeUser(function(user, done) {
          done(null, user.id);
        });
      
        passport.deserializeUser(function(id, done) {
          User.findById(id, function(err, user) {
            done(err, user);
          });
        });

        passport.use('localSignin', new LocalStrategy({
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true
          }, function(req, email, password, done) {
            process.nextTick(function () {
                console.log(email);
                console.log(password);
              User.findOne({email: email}, function(err, user) {
                if (err) {
                  return done(err);
                }
                if (!user) {
                  return done(null, false, req.flash('danger', '존재하지 않는 사용자입니다.'));
                }
                if (!user.validatePassword(password)) {
                  return done(null, false, req.flash('danger', '비밀번호가 일치하지 않습니다.'));
                }
                return done(null, user, req.flash('success', '로그인되었습니다.'));
              });
            });
        }));
    };