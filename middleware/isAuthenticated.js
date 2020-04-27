exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }

  const error = new Error('Access Error.');
  error.code = 401;
  next(error);
}