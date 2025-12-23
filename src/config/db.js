// src/config/db.js
const { Sequelize } = require('sequelize');
const logger = require('../utils/logger'); // Если у вас есть логгер

// Создаём экземпляр Sequelize для подключения к MySQL
const sequelize = new Sequelize(
  'event_managment_system', // Название вашей БД из Workbench
  'root',    // Обычно 'root'
  'andreaee228258', {
    host: 'localhost',    // Хост БД (обычно localhost)
    port: 3306,          // Стандартный порт MySQL
    dialect: 'mysql',     // Указываем диалект БД!
    logging: (msg) => logger.debug(msg), // Опционально: логирование запросов
    pool: {
      max: 10,           // Максимальное количество соединений в пуле
      min: 0,
      acquire: 30000,    // Время (мс) для попытки установить соединение
      idle: 10000        // Время (мс) простоя соединения до закрытия
    }
  }
);

// Проверка подключения (опционально, но полезно для дебага)
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Подключение к MySQL успешно установлено.');
  } catch (error) {
    console.error('❌ Не удалось подключиться к MySQL:', error.message);
  }
}
testConnection();

module.exports = sequelize;