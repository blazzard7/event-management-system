const bcrypt = require('bcrypt');
const AppError = require('../lib/AppError');
const userRepository = require('../repositories/userRepository');
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

module.exports = { register, login };
