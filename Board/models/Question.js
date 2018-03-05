var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    number: String,
    writer: String,
    title: String,
    contents: String,
    user_Id: String,
    comments: [{
        name: String,
        user_id: String,
        memo: String,
        date: {type: Date, default: Date.now}
    }],
    count: {type:Number, default: 0},
    date: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

var Question = mongoose.model('Question', schema);

module.exports = Question;