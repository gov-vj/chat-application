exports.loginFormValidator = (req, res, next) => {
  if (req.body.username && req.body.username.trim() && req.body.password) {
    return next();
  }
  
  res.status(400).json({
    username: !!(req.body.username && req.body.username.trim()),
    password: !!req.body.password
  });
}