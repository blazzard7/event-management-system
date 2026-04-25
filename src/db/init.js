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
    short_description VARCHAR(255) NOT NULL DEFAULT '',
    description TEXT,
    image_url VARCHAR(500) NULL,
    start_at DATETIME NOT NULL,
    end_at DATETIME NOT NULL,
    status ENUM('draft','active','completed','cancelled') NOT NULL DEFAULT 'active',
    organizer_id INT NOT NULL,
    category_id INT NULL,
    location_id INT NULL,
    max_participants INT NOT NULL DEFAULT 0,
    invitation_code CHAR(6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_events_invitation_code (invitation_code),
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
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
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
      ['Главный зал', 'ул. Ленина, 1', 'Екатеринбург', 120, 'Конференц-зал', 'ул. Малышева, 5', 'Екатеринбург', 40]
    );
  }

  const [[{ ekbCount }]] = await appPool.query('SELECT COUNT(*) AS ekbCount FROM locations WHERE city = ?', ['Екатеринбург']);
  if (!ekbCount) {
    await appPool.query(
      'INSERT INTO locations (name, address, city, capacity) VALUES (?, ?, ?, ?), (?, ?, ?, ?)',
      ['Главный зал', 'ул. Ленина, 1', 'Екатеринбург', 120, 'Конференц-зал', 'ул. Малышева, 5', 'Екатеринбург', 40]
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

async function ensureColumn(tableName, columnName, definition) {
  const [rows] = await appPool.query(
    `SELECT COUNT(*) AS count
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [tableName, columnName]
  );

  if (!rows[0]?.count) {
    await appPool.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

async function ensureIndex(tableName, indexName, statement) {
  const [rows] = await appPool.query(
    `SELECT COUNT(*) AS count
     FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    [tableName, indexName]
  );

  if (!rows[0]?.count) {
    await appPool.query(statement);
  }
}

async function backfillInvitationCodes() {
  const [events] = await appPool.query('SELECT id FROM events WHERE invitation_code IS NULL OR invitation_code = ""');
  for (const event of events) {
    let code;
    let exists = true;

    while (exists) {
      code = String(Math.floor(100000 + Math.random() * 900000));
      const [rows] = await appPool.query('SELECT id FROM events WHERE invitation_code = ?', [code]);
      exists = Boolean(rows.length);
    }

    await appPool.query('UPDATE events SET invitation_code = ? WHERE id = ?', [code, event.id]);
  }
}

async function initializeDatabase() {
  await adminPool.query(`CREATE DATABASE IF NOT EXISTS \`${config.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  for (const statement of schemaStatements) {
    await appPool.query(statement);
  }
  await ensureColumn('events', 'short_description', "VARCHAR(255) NOT NULL DEFAULT '' AFTER title");
  await ensureColumn('events', 'image_url', 'VARCHAR(500) NULL AFTER description');
  await ensureColumn('events', 'invitation_code', "CHAR(6) NULL AFTER max_participants");
  await backfillInvitationCodes();
  await appPool.query(
    "ALTER TABLE events MODIFY invitation_code CHAR(6) NOT NULL"
  );
  await ensureIndex('events', 'uq_events_invitation_code', 'ALTER TABLE events ADD UNIQUE KEY uq_events_invitation_code (invitation_code)');
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
