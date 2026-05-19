const bcrypt = require('bcrypt');
const AppError = require('../lib/AppError');
const userRepository = require('../repositories/userRepository');
const passwordResetRepository = require('../repositories/passwordResetRepository');
const emailService = require('./emailService');
const { validateRegistrationPayload, validateLoginPayload } = require('../validators/authValidator');

async function register(payload) {
  const data = validateRegistrationPayload(payload);
  const existing = await userRepository.findByEmail(data.email);
  if (existing) {
    throw new AppError('Email is already registered', 409);
  }
  const passwordHash = await bcrypt.hash(data.password, 10);
  return userRepository.createUser({ ...data, passwordHash });
}

async function login(emailInput, passwordInput) {
  const { email, password } = validateLoginPayload({ email: emailInput, password: passwordInput });
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new AppError('Invalid credentials', 401);
  }
  return userRepository.findById(user.id);
}

async function requestReset(emailInput) {
  const email = String(emailInput || '').trim().toLowerCase();
  if (!email) {
    throw new AppError('Email is required', 400);
  }

  const user = await userRepository.findByEmail(email);
  if (!user) {
    return { sent: false, reason: 'not_found' };
  }

  const token = await passwordResetRepository.createToken(user.id);
  const resetLink = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password/${token}`;

  if (user.email_notifications) {
    await emailService.sendEmail({
      to: user.email,
      subject: 'Сброс пароля — Event City',
      text: `Вы запросили сброс пароля.\n\nПерейдите по ссылке:\n${resetLink}\n\nСсылка действует 1 час.\n\nЕсли вы не запрашивали сброс — проигнорируйте письмо.`
    }).catch(function () {});
    return { sent: true };
  }

  return { sent: false, reason: 'email_disabled', resetLink };
}

async function validateResetToken(token) {
  return passwordResetRepository.findValidToken(token);
}

async function resetPassword(token, newPassword) {
  const record = await passwordResetRepository.findValidToken(token);
  if (!record) {
    throw new AppError('Ссылка устарела или недействительна. Запросите сброс заново.', 400);
  }

  if (!newPassword || newPassword.length < 6) {
    throw new AppError('Пароль должен быть не менее 6 символов', 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await userRepository.updatePassword(record.user_id, passwordHash);
  await passwordResetRepository.markUsed(token);
}

async function updateProfile(userId, payload) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  const firstName = String(payload.firstName || '').trim();
  const lastName = String(payload.lastName || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const emailNotifications = payload.emailNotifications === true || payload.emailNotifications === 'on';

  if (!firstName || !lastName || !email) {
    throw new AppError('First name, last name and email are required', 400);
  }

  if (payload.password) {
    if (payload.password.length < 6) {
      throw new AppError('Password must be at least 6 characters long', 400);
    }
    const passwordHash = await bcrypt.hash(payload.password, 10);
    await userRepository.updatePassword(userId, passwordHash);
  }

  return userRepository.updateUser(userId, { firstName, lastName, email, emailNotifications });
}

module.exports = { register, login, requestReset, validateResetToken, resetPassword, updateProfile };
