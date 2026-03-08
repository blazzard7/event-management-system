const bcrypt = require('bcrypt');
const config = require('../config');
const { adminPool, appPool } = require('./pool');
const logger = require('../lib/logger');

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('admin','user') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    capacity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    start_at DATETIME NOT NULL,
    end_at DATETIME NOT NULL,
    status ENUM('draft','active','completed','cancelled') NOT NULL DEFAULT 'active',
    organizer_id INT NOT NULL,
    category_id INT NULL,
    location_id INT NULL,
    max_participants INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_events_organizer FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_events_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    CONSTRAINT fk_events_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_event (user_id, event_id),
    CONSTRAINT fk_reg_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reg_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comment_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    author_name VARCHAR(120) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chat_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  )`
];

async function seedDefaults() {
  const [[{ count: categoryCount }]] = await appPool.query('SELECT COUNT(*) AS count FROM categories');
  if (!categoryCount) {
    await appPool.query('INSERT INTO categories (name) VALUES (?), (?), (?)', ['Conference', 'Workshop', 'Meetup']);
  }

  const [[{ count: locationCount }]] = await appPool.query('SELECT COUNT(*) AS count FROM locations');
  if (!locationCount) {
    await appPool.query(
      'INSERT INTO locations (name, address, city, capacity) VALUES (?, ?, ?, ?), (?, ?, ?, ?)',
      ['Main Hall', 'Central St. 1', 'Amsterdam', 120, 'Conference Room', 'North Ave. 5', 'Amsterdam', 40]
    );
  }

  const [admins] = await appPool.query('SELECT id FROM users WHERE email = ?', [config.admin.email]);
  if (!admins.length) {
    const hash = await bcrypt.hash(config.admin.password, 10);
    await appPool.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
      [config.admin.email, hash, 'System', 'Admin', 'admin']
    );
  }
}

async function initializeDatabase() {
  await adminPool.query(`CREATE DATABASE IF NOT EXISTS \`${config.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  for (const statement of schemaStatements) {
    await appPool.query(statement);
  }
  await seedDefaults();
  logger.info('Database initialized');
}

if (require.main === module) {
  initializeDatabase()
    .then(async () => {
      logger.info('db:init completed');
      await adminPool.end();
      await appPool.end();
      process.exit(0);
    })
    .catch(async (error) => {
      logger.error('db:init failed', { message: error.message });
      try {
        await adminPool.end();
        await appPool.end();
      } catch (closeError) {
        logger.error('db pools close failed', { message: closeError.message });
      }
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
