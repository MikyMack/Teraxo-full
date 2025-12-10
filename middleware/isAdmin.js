module.exports = function (req, res, next) {
  if (req.session && req.session.user && req.session.user.isAdmin) {
    return next();
  } else {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
};
