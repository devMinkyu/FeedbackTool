module.exports = function(app, passport) {
    app.post('/signin', passport.authenticate('localSignin', {
        successRedirect : '/', 
        failureRedirect : '/', 
        failureFlash : true 
      }));
    
      app.get('/signout', function(req, res) {
        req.logout();
        res.redirect('/');
      });
};