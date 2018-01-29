var express = require('express');
    User = require('../models/User');

var router = express.Router();

/* GET users listing. */
router.get('/new', function(req, res, next) {
  res.render('users/register');
});

router.get('/profile', function(req, res, next) {
  res.render('services/profile');
});

router.post('/register', function(req, res, next) {
  User.findOne({email: req.body.email}, function(err, user) {
    if (err) {
      return next(err);
    }
    if (user) {
      req.flash('danger', '동일한 이메일 주소가 이미 존재합니다.');
      return res.redirect('back');
    }
    console.log(req.body);
    var newUser = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      team:4,
      //admin: 0
      admin: 1, // 0이면 관리자. 1이면 일반 유저
    });
    newUser.password = newUser.generateHash(req.body.password);

    newUser.save(function(err) {
      if (err) {
        return next(err);
      } else {
        req.flash('success', '가입이 완료되었습니다. 로그인 해주세요.');
        res.redirect('/');
      }
    });
  });
});

module.exports = router;
