var express = require('express');
var router = express.Router();
Board = require('../models/Board');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
router.get('/signin', function(req, res, next) {
  res.render('signin');
});

// router.get('/main', function(req, res, next) {
//   if(!req.user){
//       res.redirect('/');
//       return;
//   }
//   if(req.user.admin == 0){
//     Board.find({}, function(err,boards){
//         if (err) {
//             return next(err);
//         }
//         res.render('board/index',{boards:boards});
//     });
//   }else{
//     res.render('main');
//   }
// });


router.get('/plan', function(req, res, next) {
  res.render('services/plan');
});

module.exports = router;
