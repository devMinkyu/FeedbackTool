var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    projectNumber: String,
    writer: String,
    title: String,
    contents: String,
    user_Team: String,
    comments: [{
        name: String,
        userId: String,
        memo: String,
        date: {type: Date, default: Date.now},
        page: String
    }],
    count: {type:Number, default: 0},
    date: {type: Date, default: Date.now},
    updated: [{title: String, contents: String, date:{type: Date, default: Date.now}}],
    deleted: {type: Boolean, default: false}, // true면 삭제 된 경우임
    fileUp:[String] // 업로드 된 파일 저장된 주소
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

var Feedback = mongoose.model('Feedback', schema);

module.exports = Feedback;