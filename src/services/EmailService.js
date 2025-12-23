// src/services/EmailService.js
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  async sendEmail(to, subject, text, html = null) {
    try {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        logger.warn('SMTP credentials not configured. Email not sent.');
        return false;
      }

      const mailOptions = {
        from: `"Event Management System" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text
      };

      if (html) {
        mailOptions.html = html;
      }

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error(`Error sending email: ${error.message}`);
      return false;
    }
  }

  async sendRegistrationConfirmation(userEmail, eventTitle, registrationId) {
    const subject = `Регистрация подтверждена: ${eventTitle}`;
    const text = `Ваша регистрация на мероприятие "${eventTitle}" подтверждена. ID регистрации: ${registrationId}`;
    const html = `
      <h2>Регистрация подтверждена</h2>
      <p>Ваша регистрация на мероприятие <strong>${eventTitle}</strong> подтверждена.</p>
      <p>ID регистрации: <strong>${registrationId}</strong></p>
      <p>Благодарим за участие!</p>
    `;
    
    return this.sendEmail(userEmail, subject, text, html);
  }

  async sendEventReminder(userEmail, eventTitle, eventDateTime) {
    const subject = `Напоминание: ${eventTitle}`;
    const text = `Напоминаем о мероприятии "${eventTitle}" запланированном на ${eventDateTime}`;
    const html = `
      <h2>Напоминание о мероприятии</h2>
      <p>Напоминаем, что мероприятие <strong>${eventTitle}</strong> состоится ${eventDateTime}.</p>
      <p>Не забудьте подготовиться!</p>
    `;
    
    return this.sendEmail(userEmail, subject, text, html);
  }

  async sendNewEventNotification(userEmail, eventTitle, organizerName) {
    const subject = `Новое мероприятие: ${eventTitle}`;
    const text = `Организатор ${organizerName} создал новое мероприятие "${eventTitle}"`;
    const html = `
      <h2>Новое мероприятие</h2>
      <p>Организатор <strong>${organizerName}</strong> создал новое мероприятие:</p>
      <h3>${eventTitle}</h3>
      <p>Посмотрите детали на нашем сайте!</p>
    `;
    
    return this.sendEmail(userEmail, subject, text, html);
  }
}

module.exports = new EmailService();