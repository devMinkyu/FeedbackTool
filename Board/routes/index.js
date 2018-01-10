var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/main', function(req, res, next) {
  if(!req.user){
      res.redirect('/');
      return;
  }
  res.render('main');
});

router.get('/chat', function(req, res, next) {
  res.render('services/chat');
});

module.exports = router;
