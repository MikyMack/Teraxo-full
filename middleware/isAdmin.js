module.exports = function (req, res, next) {
  if (req.session && req.session.user && req.session.user.isAdmin) {
    return next();
  } else {
    // Redirect to login page instead of returning JSON for admin routes
    return res.redirect('/admin/login');
  }
};
