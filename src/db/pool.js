const mysql = require('mysql2/promise');
const config = require('../config');

const adminPool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  waitForConnections: true,
  connectionLimit: 3,
  queueLimit: 0,
  namedPlaceholders: true
});

const appPool = mysql.createPool({
  ...config.db,
  namedPlaceholders: true
});

module.exports = { adminPool, appPool };
