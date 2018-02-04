var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    number: Number,
    title: String,
    contents: String,
    count: {type:Number, default: 0},
    date: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

var Notice = mongoose.model('Notice', schema);

module.exports = Notice;