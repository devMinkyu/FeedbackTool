var express = require('express');
    User = require('../models/User');

var router = express.Router();

/* GET users listing. */
router.get('/new', function(req, res, next) {
  res.render('users/register');
});
router.get('/userlists', function(req, res, next) {
  User.find({}, function(err, users) {
    if (err) {
      return next(err);
    }
    res.render('users/userlist',{users:users});
  });
});
router.get('/profile', function(req, res, next) {
  var id = req.param('id');
  res.render('users/profile');
});
router.put('/feedbackTeam', function(req, res, next) {
  var teamCount = req.param('teamCount');
  User.find({}, function(err, users) {
    if (err) {
      return next(err);
    }
    if(teamCount == 2){
      for(var i = 0; i<users.length;i++){
        if(users[i].team == "1"){
          users[i].feedbackTeam1 = 2;
          users[i].save(function (err) {
            if (err) throw err;
          });
        }else{
          users[i].feedbackTeam1 = 1;
          users[i].save(function (err) {
            if (err) throw err;
          });
        }
      }
    }else{
      var feedbackCount = ((users.length-1)*2)/teamCount;
      var feedbackRemainder = ((users.length-1)*2)%teamCount;
      var team = new Array();
      for(var j = 0; j<teamCount;j++){
        team[j] = 0;
      }
      var max = ++teamCount;
      for(var i = 0; i<users.length;i++){
        if(users[i].admin == 0){}
        else if(users[i].admin == 1){
          do{
            var feedbackTeam = Math.floor(Math.random() * ((max) - 1)) + 1;
            if(team[feedbackTeam-1] < (feedbackCount+feedbackRemainder-1) && users[i].team != feedbackTeam){
              team[feedbackTeam-1]++;
              users[i].feedbackTeam1 = feedbackTeam;
              users[i].save(function (err) {
                if (err) throw err;
              });
              break;
            }
          }while(1);
          do{
            var feedbackTeam = Math.floor(Math.random() * ((max) - 1)) + 1;
            if(team[feedbackTeam-1] < (feedbackCount+feedbackRemainder-1) && users[i].team != feedbackTeam && users[i].feedbackTeam1 != feedbackTeam){
              team[feedbackTeam-1]++;
              users[i].feedbackTeam2 = feedbackTeam;
              users[i].save(function (err) {
                if (err) throw err;
              });
              break;
            }
          }while(1);
        }
      }
    }
    req.flash('success', '피드백 팀이 정해졌습니다.');
    res.redirect('back');
  });
});

router.put('/team', function(req, res) {
  var id = req.param('id');
  var teamNumber = req.param('teamNumber');

  User.findOne({_id: id}, function(err, user){
    if(err) throw err;
    user.team = teamNumber;
    user.save(function (err) {
      if (err) throw err;
    });
    req.flash('success', '사용자 팀이 변경되었습니다.');
    res.redirect('back');
  });
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
