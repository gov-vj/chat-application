const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    require: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }
});

UserSchema.pre('save', function(next) {
  const user = this;
  bcrypt.hash(user.password, 10)
    .then(hash => {
      user.password = hash;
      next();
    })
    .catch(e => next(e));
});

UserSchema.statics.authenticate = function(username, password, callback) {
  User.findOne({ username })
    .exec()
    .then(user => {
      if (!user) {
        const err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }

      bcrypt.compare(password,user.password)
        .then(result => result ? callback(null, user): callback())
        .catch(e => callback(e))
    })
    .catch(e => callback(e));
}

var User = mongoose.model('User', UserSchema);
module.exports = User;