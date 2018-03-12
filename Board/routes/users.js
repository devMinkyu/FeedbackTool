var express = require('express');
    User = require('../models/User');
    Feedback = require('../models/Feedback');
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
    res.render('users/userlist',{users:users, navs:["학생 목록"]});
  });
});
router.get('/profile', function(req, res, next) {
  var id = req.param('id');
  User.findOne({_id: id}, function(err, user){
    if(err) throw err;
    User.find({team:user.team},function(err, users){
      if(err) throw err;
      Feedback.find({user_Team:user.team}).sort({projectNumber:1}).exec(function(err, showFeedbacks){
        if(err) throw err;
        var reply_pg = [];
        var a = showFeedbacks;
        for(var i = 0;i<showFeedbacks.length;i++){
          reply_pg[i] = Math.ceil(showFeedbacks[i].comments.length/5);
          a[i].comments = quickSort(showFeedbacks[i].comments);
        }
        res.render('users/profile',{user:user, users:users,replyPage: reply_pg, showFeedbacks:showFeedbacks, navs:["나의 공간"]});
      });
    });
  });
});
router.get('/feedback', function(req, res) {
  // feedback ajax로 페이징 하는 부분
  var id = req.param('id');
  var page = req.param('page');
  var max = req.param('max'); // feedback 총 갯수 확인
  var skipSize = (page-1)*5;
  var limitSize = skipSize + 5;

  if(max < skipSize+5) {limitSize = max*1;}

  Feedback.findOne({_id: id} , function(err, pageReply){
      if(err) throw err;
      var a = pageReply;
      a.comments = quickSort(pageReply.comments);
      var limitFeedback =[];
      for(var i =skipSize;i<limitSize;i++){
        limitFeedback[i-skipSize] = pageReply.comments[i];
      }
      res.send(limitFeedback);
  });
});
router.get('/offerFeedback', function(req, res) {
  // feedback ajax로 페이징 하는 부분
  var page = req.param('page');
  var max = req.param('max');
  var projectNumber = req.param('projectNumber');
  var skipSize = (page-1)*5;
  var limitSize = skipSize + 5;

  if(max < skipSize+5) {limitSize = max*1;}

  Feedback.find({$and: [{$or: [{user_Team :req.user.feedbackTeam1} ,{user_Team :req.user.feedbackTeam2}]}, {projectNumber:projectNumber}]},function(err, pageReply) {
    if(err) throw err;
    var a = pageReply;
    var limitFeedback =[];
    var j = 0;
    for(var i = 0;i<pageReply.length;i++){
      a[i].comments = quickSort(pageReply[i].comments);
      for(var k = 0;k<pageReply[i].comments.length;k++){
        if(pageReply[i].comments[k].userId==req.user._id){
          limitFeedback[j] = pageReply[i].comments[k];
          j++;
        }
      }
    }
    var limitOfferFeedback =[];
    for(var i =skipSize;i<limitSize;i++){
      limitOfferFeedback[i-skipSize] = limitFeedback[i];
    }
    res.send(limitOfferFeedback);
  });
});
router.put('/feedbackTeam', function(req, res, next) {
  var teamCount = req.param('teamCount');
  User.find({admin:1}, function(err, users) {
    if (err) {
      return next(err);
    }
    if(teamCount == 2){
      for(var i = 0; i<users.length;i++){
        users[i].feedbackTeam1 = 0;
        users[i].feedbackTeam2 = 0;
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
      var feedbackCount = ((users.length)*2)/teamCount;
      var feedbackRemainder = ((users.length)*2)%teamCount;
      if(feedbackRemainder == 0){
        feedbackRemainder = 1;
      }
      var team = new Array();
      for(var j = 0; j<teamCount;j++){
        team[j] = 0;
      }
      var max = ++teamCount;
      for(var i = 0; i<users.length;i++){
        if(users[i].admin == 0){}
        else if(users[i].admin == 1){
          users[i].feedbackTeam1 = 0;
          users[i].feedbackTeam2 = 0;
          var feedbackTeam1 = Math.floor(Math.random() * ((max) - 1)) + 1;
          var feedbackTeam2 = Math.floor(Math.random() * ((max) - 1)) + 1;
          while(feedbackTeam1==feedbackTeam2 || feedbackTeam1 == users[i].team || feedbackTeam2 == users[i].team || 
            team[feedbackTeam1-1] > (feedbackCount+feedbackRemainder-1) || team[feedbackTeam2-1] > (feedbackCount+feedbackRemainder-1)){
            feedbackTeam1 = Math.floor(Math.random() * ((max) - 1)) + 1;
            feedbackTeam2 = Math.floor(Math.random() * ((max) - 1)) + 1;
          }
          team[feedbackTeam1-1]++;
          team[feedbackTeam2-1]++;
          users[i].feedbackTeam1 = feedbackTeam1;
          users[i].feedbackTeam2 = feedbackTeam2;
          users[i].save(function (err) {
            if (err) throw err;
          });
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
      team: "0",
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

function quickSort(arr){
  if(arr.length < 2)
      return arr;

  var pivot = arr[Math.floor(arr.length/2)].page;
  pivot *= 1;
  var middle = arr.filter(function (data) {return data.page == pivot;});
  var lows = quickSort(arr.filter(function (data) {return data.page < pivot;}));
  var highs = quickSort(arr.filter(function (data) {return data.page > pivot;}));
  
  return lows.concat(middle).concat(highs);
}

