const { fail } = require('../lib/http');
const userRepository = require('../repositories/userRepository');

async function attachCurrentUser(req, res, next) {
  const userId = req.session?.userId;
  req.currentUser = userId ? await userRepository.findById(userId) : null;
  res.locals.currentUser = req.currentUser;
  next();
}

function requireAuth(req, res, next) {
  if (!req.currentUser) {
    return res.redirect('/login');
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.currentUser || req.currentUser.role !== 'admin') {
    return res.status(403).render('pages/error', {
      title: 'Forbidden',
      currentUser: req.currentUser,
      message: 'Admin access is required.'
    });
  }
  next();
}

function requireApiAuth(req, res, next) {
  if (!req.currentUser) {
    return fail(res, 401, 'Authentication required');
  }
  next();
}

function requireApiAdmin(req, res, next) {
  if (!req.currentUser || req.currentUser.role !== 'admin') {
    return fail(res, 403, 'Admin access is required');
  }
  next();
}

module.exports = { attachCurrentUser, requireAuth, requireAdmin, requireApiAuth, requireApiAdmin };
