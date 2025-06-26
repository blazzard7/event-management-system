// src/config/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 2525, // Порт локального SMTP-сервера
  secure: true, // true для 465, false для других портов
});

module.exports = transporter;