const authService = require('../services/authService');
const userRepository = require('../repositories/userRepository');
const { ok } = require('../lib/http');

async function showLogin(req, res) {
  res.render('pages/login', { title: 'Вход', currentUser: req.currentUser, error: null });
}

async function showRegister(req, res) {
  res.render('pages/register', { title: 'Регистрация', currentUser: req.currentUser, error: null });
}

async function loginWeb(req, res) {
  const user = await authService.login(req.body.email, req.body.password);
  req.session.userId = user.id;
  req.flash('success', 'Вы успешно вошли');
  res.redirect('/profile');
}

async function registerWeb(req, res) {
  const user = await authService.register(req.body);
  req.session.userId = user.id;
  req.flash('success', 'Аккаунт создан');
  res.redirect('/my-events');
}

async function logout(req, res) {
  req.flash('info', 'Вы вышли');
  req.session.destroy(() => res.redirect('/'));
}

async function profile(req, res) {
  const currentUser = await userRepository.findById(req.session.userId);
  res.render('pages/profile', { title: 'Профиль', currentUser });
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

async function showForgotForm(req, res) {
  res.render('pages/forgot-password', { title: 'Сброс пароля', currentUser: req.currentUser });
}

async function forgotPassword(req, res) {
  const result = await authService.requestReset(req.body.email);
  if (result.sent) {
    req.flash('success', 'Если email зарегистрирован, ссылка для сброса отправлена');
  } else if (result.reason === 'email_disabled') {
    req.flash('info', `Ссылка для сброса пароля: ${result.resetLink}`);
  } else {
    req.flash('info', 'Если email зарегистрирован, ссылка для сброса отправлена');
  }
  res.redirect('/login');
}

async function showResetForm(req, res) {
  const record = await authService.validateResetToken(req.params.token);
  if (!record) {
    req.flash('error', 'Ссылка устарела или недействительна');
    return res.redirect('/forgot-password');
  }
  res.render('pages/reset-password', { title: 'Новый пароль', currentUser: null, token: req.params.token });
}

async function resetPassword(req, res) {
  await authService.resetPassword(req.params.token, req.body.password);
  req.flash('success', 'Пароль изменён. Войдите с новым паролем.');
  res.redirect('/login');
}

async function showEditProfile(req, res) {
  const currentUser = await userRepository.findById(req.session.userId);
  res.render('pages/profile-edit', { title: 'Редактировать профиль', currentUser });
}

async function updateProfileWeb(req, res) {
  await authService.updateProfile(req.session.userId, req.body);
  req.flash('success', 'Профиль обновлён');
  res.redirect('/profile');
}

module.exports = {
  showLogin,
  showRegister,
  loginWeb,
  registerWeb,
  logout,
  profile,
  loginApi,
  registerApi,
  showForgotForm,
  forgotPassword,
  showResetForm,
  resetPassword,
  showEditProfile,
  updateProfileWeb
};
