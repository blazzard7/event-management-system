Как развернуть на любом ПК
1. Установить базовое ПО

На любом ПК нужны:

Node.js 20 LTS или 22 LTS

MySQL Server 8.x

Git

Это требование следует из того, что проект запускается через Node.js, а серверный код подключается к MySQL на localhost:3306.

2. Скачать проект

В терминале:

git clone https://github.com/blazzard7/event-management-system.git
cd event-management-system
3. Не использовать node_modules из репозитория

В репозитории уже лежит папка node_modules, но для переноса на любой ПК ее лучше удалить и установить зависимости заново:

rm -rf node_modules
npm install

На Windows PowerShell:

Remove-Item -Recurse -Force node_modules
npm install

Это нужно, потому что node_modules не переносимы между разными ОС и иногда между версиями Node. Сам факт наличия node_modules в репозитории виден в структуре проекта.

4. Доустановить отсутствующие зависимости

Так как в коде используются sequelize и cors, а в package.json их нет, нужно установить их вручную:

npm install sequelize cors

Иначе приложение упадет на require('sequelize') или require('cors').

5. Создать и настроить MySQL

Открой MySQL и создай БД:

CREATE DATABASE event_managment_system;

Затем создай пользователя либо используй своего локального пользователя MySQL. Код по умолчанию подключается к:

БД event_managment_system

хост localhost

порт 3306

6. Исправить .env

Сейчас в публичном .env уже прописаны имя БД, пользователь, пароль, хост и порт. Для развёртывания на любом ПК эти значения нужно заменить на локальные, а также добавить JWT_SECRET, потому что код логина использует его для JWT.

Пример .env:

DB_NAME=event_managment_system
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
PORT=3000
JWT_SECRET=change_this_to_long_random_secret
NODE_ENV=development
7. Исправить файл src/index.js

В src/index.js используется fs.existsSync(...), но модуль fs не импортирован. Добавь в начало файла:

const fs = require('fs');

Иначе сервер упадет еще до запуска. Это видно прямо в коде src/index.js: fs используется для создания папки uploads, но импорта нет.

8. Исправить отсутствующий src/config/database.js

Сервисы authService.js и eventService.js импортируют ../config/database, но такого файла нет. При этом в зависимостях есть mysql2, а сами сервисы используют pool.execute(...), то есть им нужен mysql2 pool, а не Sequelize.

Создай файл src/config/database.js с таким содержимым:

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'event_managment_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
9. Учесть, что в проекте смешаны 2 подхода к БД

Сейчас проект смешивает:

Sequelize + src/config/db.js + MySQL

raw SQL через pool.execute(...)

src/config/config.js, где описан SQLite

файл database.sqlite в корне проекта

На практике для быстрого запуска лучше идти по пути MySQL, потому что src/index.js использует sequelize.sync(), а сервисы авторизации и событий — raw SQL для MySQL. SQLite-конфиг в текущем состоянии выглядит как остаток другой реализации, а не как основной путь запуска. Это уже вывод по структуре кода.

10. Бэкап БД

Минимальная схема для запуска:

USE event_managment_system;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255),
  city VARCHAR(100),
  capacity INT DEFAULT 0
);

CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date_time DATETIME NOT NULL,
  location_id INT,
  organizer_id INT NOT NULL,
  max_participants INT DEFAULT 0,
  price DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
  FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_registration (user_id, event_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

Это не официальная схема из репозитория, а восстановленная по SQL-запросам в сервисах. Она покрывает те поля, которые код явно читает и записывает.

11. Запустить проект

Для разработки:

npm run dev

Для обычного запуска:

npm start

Скрипты именно такие указаны в package.json.

12. Проверить в браузере

После запуска открой:

http://localhost:3000/ — главная

http://localhost:3000/login — вход

http://localhost:3000/register — регистрация

http://localhost:3000/api-docs — Swagger
Есть еще несколько мест, которые выглядят проблемными:

scheduler.js использует Event, User и Op, но в самом файле они не импортированы; значит планировщик может падать при выполнении.

В src/index.js стоит жестко заданный секрет сессии secret_startsev; для нормального развёртывания лучше вынести его в .env.
