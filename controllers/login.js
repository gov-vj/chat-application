const path = require('path');
const User = require('../models/user');

exports.getLoginPage = (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'html', 'login.html'));
};

exports.authenticateUser = (req, res, next) => {
  User.authenticate(req.body.username, req.body.password, (error, user) => {
    if (error || !user) {
      res.status(401).json({
        authenticated: false
      });
    }

      req.session.userId = user._id;
      req.session.username = user.username;
      res.json({
        authenticated: true
      });
    });
};

exports.registerUser = (req, res, next) => {
  const userData = {
    username: req.body.username,
    password: req.body.password
  }

  User.create(userData)
    .then((user) => {
      req.session.userId = user._id;
      req.session.username = user.username;
      res.json({
        registered: true
      });
    })
    .catch(e => {
      if (e.code === 11000) {
        return res.status(400).json({
          userExists: true
        });
      }

      res.status(500).json({
        serverError: true
      });
    });
};