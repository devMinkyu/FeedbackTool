var express = require('express');
    User = require('../models/User');
var router = express.Router();

router.get('/guide', function(req, res, next) {
    res.render('training/guide');
});
router.get('/training', function(req, res, next) {
    res.render('training/training');
});
router.get('/solution', function(req, res, next) {
    User.findOne({email:req.user.email}, function(err, user) {
        if (err) {
          return next(err);
        }
        res.render('training/solution', {user:user});
    });
});
router.post('/', function(req, res, next){
    User.findOne({email:req.user.email}, function(err, user) {
        if (err) {
          return next(err);
        }
        User.update({_id: user._id}, {$unset: {feedback: true}}, function (err) {
            if (err) throw err;
        });
        var solution = [];
        solution[0] = req.body.solution1; 
        solution[1] = req.body.solution2; 
        solution[2] = req.body.solution3; 
        for (var j = 0; j < 3; j++) {
            User.update({_id: user._id}, {$push: {feedback: solution[j]}}, function (err) {
                if (err) throw err;
            });
        }
    });
    res.redirect('/training/solution');
});
module.exports = router;
