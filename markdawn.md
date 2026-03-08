Что нужно заранее

На ПК должны быть установлены:

Node.js 18+

MySQL Server 8.x

желательно MySQL Workbench для удобной проверки БД

Проект рассчитан на:

backend на Node.js/Express

БД MySQL

автоинициализацию схемы при старте

запуск одной командой: npm run start:one

Вариант 1. Локальный запуск на Windows
1. Распаковать проект

Распакуй архив, например в:

C:\projects\event-management-system-production

Перейди в эту папку через PowerShell.

2. Установить зависимости

В папке проекта выполни:

npm install
3. Запустить MySQL

Нужно, чтобы служба MySQL уже работала.

Проверить можно так:

открыть MySQL Workbench

подключиться к Local instance MySQL

Если подключение открывается — сервер БД работает.

4. Создать .env

В корне проекта скопируй пример:

Copy-Item .env.example .env
5. Заполнить .env

Открой .env и укажи реальные параметры MySQL.

Пример:

NODE_ENV=development
PORT=3000
JWT_SECRET=change_this_secret

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=ВАШ_ПАРОЛЬ_ОТ_MYSQL
DB_NAME=event_management_system

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin123!

Важно:

DB_USER и DB_PASSWORD должны совпадать с пользователем MySQL

DB_NAME можно оставить как есть

6. Выдать пользователю MySQL права на создание базы

Если ты используешь root, обычно ничего дополнительно делать не нужно.

Если используется другой пользователь, у него должны быть права:

на создание базы

на создание таблиц

на вставку и обновление данных

7. Запустить проект одной командой
npm run start:one

Что должно произойти:

приложение подключится к MySQL

при необходимости создаст базу event_management_system

создаст таблицы

создаст администратора из .env

запустит cron-задачи

поднимет HTTP-сервер

поднимет socket.io

8. Проверить запуск

Открыть в браузере:

http://localhost:3000

Проверка health:

http://localhost:3000/health

Swagger:

http://localhost:3000/api-docs
9. Вход под администратором

Если проект создаёт admin автоматически, используй данные из .env:

email: admin@example.com
password: Admin123!

Либо свои, если ты их поменял.

Что именно разворачивается вместе с БД

При запуске npm run start:one должны подниматься сразу все части:

веб-приложение

API

соединение с MySQL

автоинициализация БД

таблицы

сидирование администратора

планировщик задач

чат через socket.io

То есть БД не запускается из Node.js сама как отдельная программа — MySQL должен быть установлен и запущен заранее, а приложение уже подключается к нему и разворачивает свою схему.

Как это выглядит по шагам внутри проекта

Обычно цепочка такая:

читается .env

создаётся pool MySQL

вызывается инициализация БД

создаются таблицы:

users

events

registrations

categories

locations

comments

notifications

служебные таблицы, если они предусмотрены

создаётся admin

стартует сервер

Если база не создаётся автоматически

Если в твоей версии проекта автоинициализация создаёт только таблицы, но не саму базу, тогда сначала вручную создай БД в MySQL Workbench:

CREATE DATABASE event_management_system;

После этого снова запусти:

npm run start:one
Как развернуть на другом ПК

На любом другом ПК порядок тот же:

установить Node.js

установить MySQL

распаковать проект

выполнить npm install

создать .env

указать логин/пароль MySQL

выполнить npm run start:one

Как развернуть на сервере

Если нужно не просто локально, а на VPS/сервере, порядок почти тот же:

1. Установить:

Node.js

MySQL Server

PM2

2. Настроить .env

Пример:

NODE_ENV=production
PORT=3000
JWT_SECRET=very-strong-secret

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=app_user
DB_PASSWORD=strong_password
DB_NAME=event_management_system

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin123!
3. Установить зависимости
npm install --production
4. Запустить инициализацию и сервер

Если используется one-command script:

npm run start:one

или через PM2:

pm2 start ecosystem.config.js
5. Настроить reverse proxy

Обычно перед Node.js ставят Nginx:

принимает запросы на 80/443

проксирует на localhost:3000

6. Для production желательно:

включить HTTPS

ограничить доступ к MySQL только локально

сделать резервные копии БД

использовать отдельного пользователя MySQL, а не root

Рекомендуемая схема MySQL для production

Лучше создать отдельного пользователя:

CREATE DATABASE event_management_system;
CREATE USER 'event_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON event_management_system.* TO 'event_user'@'localhost';
FLUSH PRIVILEGES;

И в .env:

DB_HOST=localhost
DB_PORT=3306
DB_USER=event_user
DB_PASSWORD=strong_password
DB_NAME=event_management_system

Так безопаснее, чем работать через root.

Если что-то не запускается
Ошибка подключения к MySQL

Проверь:

MySQL действительно запущен

правильный пароль в .env

правильный порт 3306

правильный пользователь

Ошибка “Unknown database”

Создай БД вручную:

CREATE DATABASE event_management_system;
Ошибка прав доступа

Нужно выдать пользователю права на БД.

Ошибка порта 3000

Значит порт занят. В .env можно поменять:

PORT=3001
Минимальная инструкция для преподавателя

Развёртывание системы выполняется следующим образом:
Сначала на компьютер устанавливаются Node.js и MySQL Server. Затем проект распаковывается в локальную директорию, после чего в корне проекта создаётся файл .env на основе .env.example, где задаются параметры подключения к MySQL и служебные переменные приложения. Далее устанавливаются зависимости командой npm install. После этого выполняется запуск npm run start:one, в ходе которого приложение подключается к MySQL, создаёт структуру базы данных, добавляет администратора и запускает веб-сервер. После завершения запуска система доступна по адресу http://localhost:3000, а документация API — по адресу http://localhost:3000/api-docs.

