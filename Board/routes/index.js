var express = require('express');
var router = express.Router();
Notice = require('../models/Notice');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
router.get('/signin', function(req, res, next) {
  res.render('signin');
});

module.exports = router;
