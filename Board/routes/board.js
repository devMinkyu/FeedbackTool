var express = require('express');
    Board = require('../models/Board');
var multer = require('multer');
var fs = require('fs');
var _storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './tmp');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
var upload = multer({storage: _storage});
var router = express.Router();

router.get('/', function(req, res, next) {
    if(!req.user){
        res.redirect('/');
        return;
    }
    Board.find({}, function(err,boards){
        if (err) {
            return next(err);
        }
        res.render('board/index',{boards:boards});
    });
});

router.get('/new', function(req, res, next) {
    if(!req.user){
        res.redirect('/');
        return;
    }
    res.render('board/new');
});

router.post('/', upload.array('UploadFile'),function(req, res){
    //field name은 form의 input file의 name과 같아야함
    var mode = req.param('mode');
    var addNewTitle = req.body.addContentSubject;
    var addNewWriter = req.body.addContentWriter;
    var addNewPassword = req.body.addContentPassword;
    var addNewContent = req.body.addContents;
    var upFile = req.files; // 업로드 된 파일을 받아옴
    if(!isPDF(upFile)){
        req.flash('info', "PDF 파일이 아닙니다.");
        res.redirect('/board/new');
        return;
    }
    if(mode == 'add') {
        if (isSaved(upFile)) { // 파일이 제대로 업로드 되었는지 확인 후 디비에 저장시키게 됨
            addBoard(addNewTitle, addNewWriter, addNewContent, addNewPassword, upFile, req.user._id);
            res.redirect('/board');
        } else {
          console.log("파일이 저장되지 않았습니다!");
        }
    }
});

router.get('/download/:path', function(req, res){
    // file download
    var path = req.params.path;
    res.download('./tmp/'+path, path);
    console.log(path);
});

module.exports = router;

function addBoard(title, writer, content, password, upFile, userId){
    var newContent = content.replace(/\r\n/gi, "\\r\\n");

    var newBoardContents = new Board();
    newBoardContents.writer = writer;
    newBoardContents.title = title;
    newBoardContents.contents = newContent;
    newBoardContents.password = password;
    newBoardContents.user_Id = userId;

    newBoardContents.save(function (err) {
        if (err) throw err;
        Board.findOne({_id: newBoardContents._id}, {_id: 1}, function (err, newBoardId) {
            if (err) throw err;

            if (upFile != null) {
                var renaming = renameUploadFile(newBoardId.id, upFile);

                for (var i = 0; i < upFile.length; i++) {
                    fs.rename(renaming.tmpname[i], renaming.fsname[i], function (err) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                    });
                }

                for (var j = 0; j < upFile.length; j++) {
                    Board.update({_id: newBoardId.id}, {$push: {fileUp: renaming.fullname[j]}}, function (err) {
                        if (err) throw err;
                    });
                }
            }
        });
    });
}

function isPDF(upFile){
    var newFile = upFile; // 새로 들어 온 파일
    var tmpType = newFile[0].mimetype.split('/')[1];
    console.log(tmpType);
    if(tmpType == 'pdf'){
        return true;
    }else{
        return false;
    }
}

function getFileDate(date) {
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    var day = date.getDate();
    var hour = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();

    var fullDate = year+""+month+""+day+""+hour+""+min+""+sec;

    return fullDate;
}

function renameUploadFile(itemId,upFile){
    // 업로드 할때 리네이밍 하는 곳!
    var renameForUpload = {};
    var newFile = upFile; // 새로 들어 온 파일
    var tmpPath = [];
    var tmpType = [];
    var index = [];
    var rename = [];
    var fileName = [];
    var fsName = [];

    for (var i = 0; i < newFile.length; i++) {
        tmpPath[i] = newFile[i].path;
        tmpType[i] = newFile[i].mimetype.split('/')[1]; // 확장자 저장해주려고!
        index[i] = tmpPath[i].split('/').length;
        rename[i] = tmpPath[i].split('/')[index[i] - 1];
        fileName [i] = itemId + "_" + getFileDate(new Date()) + "_" + rename[i] + "." + tmpType[i]; // 파일 확장자 명까지 같이 가는 이름 "글아이디_날짜_파일명.확장자"
        fsName [i] = getDirname(1)+"upload/"+fileName[i]; // fs.rename 용 이름 "./upload/글아이디_날짜_파일명.확장자"
    }

    renameForUpload.tmpname = tmpPath;
    renameForUpload.filename = fileName;
    renameForUpload.fullname = rename;
    renameForUpload.fsname = fsName;

    return renameForUpload;
}

function getDirname(num){
    //원하는 상위폴더까지 리턴해줌. 0은 현재 위치까지, 1은 그 상위.. 이런 식으로
    // 리네임과, 파일의 경로를 따오기 위해 필요함.

    var order = num;
    var dirname = __dirname.split('/');
    var result = '';

    for(var i=0;i<dirname.length-order;i++){
        result += dirname[i] + '/';
    }

    return result;
}

function isSaved(upFile) {
    // 파일 저장 여부 확인해서 제대로 저장되면 디비에 저장되는 방식
    var savedFile = upFile;
    var count = 0;
    if(savedFile != null) { // 파일 존재시 -> tmp폴더에 파일 저장여부 확인 -> 있으면 저장, 없으면 에러메시지
        for (var i = 0; i < savedFile.length; i++) {
            if(fs.statSync(getDirname(1) + savedFile[i].path).isFile()){ //fs 모듈을 사용해서 파일의 존재 여부를 확인한다.
                count ++; // true인 결과 갯수 세서
            }
        }
        if(count == savedFile.length){  //올린 파일 갯수랑 같으면 패스
            return true;
        }else{ // 파일이 다를 경우 false를 리턴함.
            return false;
        }
    }else{ // 파일이 처음부터 없는 경우
        return true;
    }
}

