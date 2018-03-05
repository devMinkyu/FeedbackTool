var express = require('express');
Notice = require('../models/Notice');
var multer = require('multer');
var fs = require('fs');
var _storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './tmp');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  });
var upload = multer({storage: _storage});
var router = express.Router();
var count = 1;

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
    
    Notice.count({},function(err, totalCount){
        // db에서 날짜 순으로 데이터들을 가져옴
         if(err) throw err;
 
         pageNum = Math.ceil(totalCount/limitSize);
         Notice.find({}).sort({date:-1}).skip(skipSize).limit(limitSize).exec(function(err, pageContents) {
             if(err) throw err;
             res.render('notice/index', {notices: pageContents, pagination: pageNum, navs:["공지사항"]});
         });
     });
});
router.get('/new', function(req, res, next) {
    if(!req.user){
        res.redirect('/');
        return;
    }
    res.render('notice/new',{navs:["공지사항", "작성하기"]});
});
router.get('/show', function(req, res, next) {
    var id = req.param('id');
    Notice.findOne({_id:id}, function(err, notice){
        if(err) throw err;
        notice.count++;
        notice.save(function(err){
            if(err) throw err;
        });
        res.render('notice/show',{notice:notice, navs:["공지사항", "공지사항보기"]});
    });
});
//추후
router.get('/modify', function(req, res, next) {
    Notice.findOne({_id:req.param('id')}, function(err, notice){
        if(err) throw err;

        res.render('notice/new', {notice:notice});
    });
});
router.post('/', function(req, res){
    var mode = req.param('mode');
    var addNewNumber = count++;
    var addNewTitle = req.body.addContentSubject;
    var addNewContent = req.body.addContents;
    if(mode == 'add') {
        var newNoticeContents = new Notice();
            newNoticeContents.number = addNewNumber;
            newNoticeContents.title = addNewTitle;
            newNoticeContents.contents = addNewContent;
        newNoticeContents.save(function (err) {
            if (err) throw err;
        });
        req.flash('success', "공지사항이 성공적으로 등록 되었습니다.");
        res.redirect('/notice');
    }

});
router.delete('/delete', function(req, res, next) {
    Notice.findOneAndRemove({_id: req.param('id')}, function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', "공지사항이 성공적으로 삭제 되었습니다.");
      res.redirect('/notice');
    });
  });

module.exports = router;


