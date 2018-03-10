var express = require('express');
var router = express.Router();
Question = require('../models/Question');
var count = 1;
ObjectId = require('mongodb').ObjectID;
router.get('/', function(req, res, next) {
    // 처음 index로 접속 했을시 나오는 부분
    // db에서 게시글 리스트 가져와서 출력
    // pagination 추가 -> 11/17
    // page는 1-5까지 보여줌 -> db에서 총 갯수 잡아와서 10으로 나눠서 올림해야함
    // 한페이지에 10개의 게시글: limit: 10, skip: (page-1)*10 이면 될 듯
    // page number는 param으로 받아오기 가장 처음엔 param 없으니까 그땐 자동 1로 설정

    var page = req.param('page');
    if(page == null) {page = 1;}

    var skipSize = (page-1)*10;
    var limitSize = 10;
    var pageNum = 1;
    
    Question.count({},function(err, totalCount){
        // db에서 날짜 순으로 데이터들을 가져옴
         if(err) throw err;
 
         pageNum = Math.ceil(totalCount/limitSize);
         Question.find({}).sort({date:-1}).skip(skipSize).limit(limitSize).exec(function(err, pageContents) {
             if(err) throw err;
             res.render('notice/qaindex', {questions: pageContents, pagination: pageNum, navs:["Q&A"]});
         });
     });
});
router.get('/new', function(req, res, next) {
    res.render('notice/qanew',{navs:["Q&A", "작성하기"]});
});
router.get('/show', function(req, res, next) {
    if(!req.user){
        res.redirect('/');
        return;
    }
    Question.findOne({_id:req.param('id')}, function(err, question){
        if(err) throw err;
        var reply_pg = Math.ceil(question.comments.length/5);
        res.render('notice/qashow', {question:question, replyPage: reply_pg, navs:["Q&A", "질문보기"]});
    });
});
// 수정 추후
router.get('/modify', function(req, res, next) {
    Question.findOne({_id:req.param('id')}, function(err, question){
        if(err) throw err;
        res.render('notice/qanew', {question:question, replyPage: reply_pg});
    });
});
router.post('/', function(req, res){
    //field name은 form의 input file의 name과 같아야함
    var mode = req.param('mode');
    var addNewNumber = count++;
    var addNewTitle = req.body.addContentSubject;
    var addNewWriter = req.user.name;
    var addNewUserId = req.user._id;
    var addNewContent = req.body.addContents;
    addNewContent = addNewContent.replace(/(?:\r\n|\r|\n)/g, '<br>');
    if(mode == 'add') {
        var newQuestionContents = new Question();
            newQuestionContents.number = addNewNumber;
            newQuestionContents.writer = addNewWriter;
            newQuestionContents.title = addNewTitle;
            newQuestionContents.contents = addNewContent;
            newQuestionContents.user_Id = addNewUserId;

        newQuestionContents.save(function (err) {
            if (err) throw err;
        });
        res.redirect('/question');
    }
});

router.post('/reply', function(req, res){
    // 댓글 다는 부분
    var reply_writer = req.user.name;
    var reply_userId = req.user._id;
    var reply_comment = req.body.addContents;
    reply_comment = reply_comment.replace(/(?:\r\n|\r|\n)/g, '<br>');
    var reply_id = req.param('id');

    addComment(reply_id, reply_writer, reply_comment, reply_userId);

    res.redirect('/question/show?id='+reply_id);
});

router.get('/reply', function(req, res) {
    // 댓글 ajax로 페이징 하는 부분
    var id = req.param('id');
    var page = req.param('page');
    var max = req.param('max'); // 댓글 총 갯수 확인
    var skipSize = (page-1)*5;
    var limitSize = skipSize + 5;
    if(max == 0){
        return;
    }
    if(max < skipSize+5) {limitSize = max*1;} // 댓글 갯수 보다 넘어가는 경우는 댓글 수로 맞춰줌 (몽고디비 쿼리에서 limit은 양의 정수여야함)

    Question.findOne({_id: id}, {comments: {$slice: [skipSize, limitSize]}} , function(err, pageReply){
        if(err) throw err;
        res.send(pageReply.comments);
    });
});

router.delete('/delete', function(req, res, next) {
    Question.findOneAndRemove({_id: req.param('id')}, function(err) {
      if (err) {
        return next(err);
      }
      res.redirect('/question');
    });
  });


router.get('/reply/delete', function(req, res, next) {
    var replyId = req.param('replyId')
    Question.findOne({_id: req.param('id')}, function(err, question) {
      if (err) {
        return next(err);
      }
      question.count--;
      question.comments.pull({_id:replyId});
      question.save(function(err){
          if(err) throw err;
      });
      res.redirect('back');
    });
  });
module.exports = router;

function addComment(id, writer, comment, userId) {
    Question.findOne({_id: id}, function(err, question){
        if(err) throw err;
        question.count++;
        question.comments.unshift({name:writer, memo: comment, user_id: userId});
        question.save(function(err){
            if(err) throw err;
        });
    });
}