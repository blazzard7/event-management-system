const AppError = require('../lib/AppError');

function normalizeText(value) {
  return String(value || '').trim();
}

function validateRegistrationPayload(payload) {
  const email = normalizeText(payload.email).toLowerCase();
  const password = String(payload.password || '');
  const firstName = normalizeText(payload.firstName);
  const lastName = normalizeText(payload.lastName);

  if (!email || !password || !firstName || !lastName) {
    throw new AppError('Email, password, first name and last name are required', 400);
  }
  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters long', 400);
  }
  return { email, password, firstName, lastName };
}

function validateLoginPayload(payload) {
  const email = normalizeText(payload.email).toLowerCase();
  const password = String(payload.password || '');
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }
  return { email, password };
}

module.exports = { validateRegistrationPayload, validateLoginPayload };
