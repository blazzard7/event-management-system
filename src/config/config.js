// src/config/config.js
require('dotenv').config();

module.exports = {
  development: {
    storage: 'database.sqlite',
    dialect: 'sqlite',
  },
  test: {
    storage: 'database_test.sqlite',
    dialect: 'sqlite',
  },
  production: {
    storage: 'database_prod.sqlite',
    dialect: 'sqlite',
  },
};