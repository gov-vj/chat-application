exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    console.log(req.session);
    return next();
  }

  res.status(401).json({
    accessError: true
  });
}