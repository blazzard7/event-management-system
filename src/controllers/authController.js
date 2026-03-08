const authService = require('../services/authService');
const userRepository = require('../repositories/userRepository');
const { ok } = require('../lib/http');

async function showLogin(req, res) {
  res.render('pages/login', { title: 'Login', currentUser: req.currentUser, error: null });
}

async function showRegister(req, res) {
  res.render('pages/register', { title: 'Register', currentUser: req.currentUser, error: null });
}

async function loginWeb(req, res) {
  const user = await authService.login(req.body.email, req.body.password);
  req.session.userId = user.id;
  res.redirect('/profile');
}

async function registerWeb(req, res) {
  const user = await authService.register(req.body);
  req.session.userId = user.id;
  res.redirect('/profile');
}

async function logout(req, res) {
  req.session.destroy(() => res.redirect('/'));
}

async function profile(req, res) {
  const currentUser = await userRepository.findById(req.session.userId);
  res.render('pages/profile', { title: 'Profile', currentUser });
}

async function loginApi(req, res) {
  const user = await authService.login(req.body.email, req.body.password);
  req.session.userId = user.id;
  return ok(res, user);
}

async function registerApi(req, res) {
  const user = await authService.register(req.body);
  req.session.userId = user.id;
  return ok(res, user, 201);
}

module.exports = {
  showLogin,
  showRegister,
  loginWeb,
  registerWeb,
  logout,
  profile,
  loginApi,
  registerApi
};
