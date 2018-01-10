module.exports = function(app, passport) {
    app.post('/signin', passport.authenticate('localSignin', {
        successRedirect : '/main', 
        failureRedirect : '/', 
        failureFlash : true 
      }));
    
      app.get('/signout', function(req, res) {
        req.logout();
        req.flash('success', '로그아웃 되었습니다.');
        res.redirect('/');
      });
};