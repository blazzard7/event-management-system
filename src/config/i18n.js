// src/config/i18n.js
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    backend: {
      loadPath: __dirname + '/../locales/{{lng}}/{{ns}}.json',
    },
    fallbackLng: 'en',
    preload: ['en', 'ru'],
    saveMissing: true,
    detection: {
      order: ['querystring', 'cookie'], //?lang=en
      caches: ['cookie']
    }
  });

module.exports = i18next;