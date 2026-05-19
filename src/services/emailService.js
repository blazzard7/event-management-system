const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../lib/logger');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.pass
      }
    });
  }
  return transporter;
}

async function sendEmail({ to, subject, text, html }) {
  if (!config.email.enabled) {
    logger.info('Email disabled, skipping', { to, subject });
    return { skipped: true };
  }

  const info = await getTransporter().sendMail({
    from: config.email.from,
    to,
    subject,
    text,
    html: html || text
  });

  logger.info('Email sent', { to, subject, messageId: info.messageId });
  return info;
}

module.exports = { sendEmail };
