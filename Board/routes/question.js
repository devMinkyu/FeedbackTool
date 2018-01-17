var express = require('express');
var router = express.Router();
Question = require('../models/Question');
var count = 0;

router.get('/', function(req, res, next) {
    Question.find({}, function(err, questions){
        if(err) throw err;
        console.log(questions.length);
        res.render('board/qaindex', {questions:questions});
    });
});
router.get('/new', function(req, res, next) {
    res.render('board/qanew');
});
router.get('/show', function(req, res, next) {
    Question.findOne({_id:req.param('id')}, function(err, question){
        if(err) throw err;
        res.render('board/qashow', {question:question});
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
        res.redirect('/question')
    }
});
module.exports = router;

function addComment(id, writer, comment) {
    Question.findOne({_id: id}, function(err, question){
        if(err) throw err;

        question.comments.unshift({name:writer, memo: comment});
        question.save(function(err){
            if(err) throw err;
        });
    });
}