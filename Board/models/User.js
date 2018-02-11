var mongoose = require('mongoose'),
    bcrypt = require('bcryptjs'),
    Schema = mongoose.Schema;

var schema = new Schema({
  name: {type: String, required: true, trim: true},
  email: {type: String, required: true, index: true, unique: true, trim: true},
  phone: {type: String},
  team: {type: String},
  photoURL : {type: String},
  password: {type: String},
  admin:{type: Number},// 0 이면 관리자, 1 이면 일반유저
  example: {
    guide:{type: String},
    solution:{type: String},
    training:{type: String},
    sampleAnswer1:{type: String},
    trainingExample:{type: String}
  },
  feedback:{type: String},
  feedbackTeam1: {type: String},
  feedbackTeam2: {type: String}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

schema.methods.generateHash = function(password) {
  var salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

schema.methods.validatePassword = function(password) {
  if (this.password) {
    return bcrypt.compareSync(password, this.password);
  }
  return false;
};

var User = mongoose.model('User', schema);

module.exports = User;