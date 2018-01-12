var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('training/index');
});

router.get('/guide', function(req, res, next) {
    res.render('training/guide');
});
module.exports = router;
