const express = require('express');
const { swaggerUi, specs } = require('./swagger/swaggerConfig.js');
const eventRoutes = require('./routes/eventRoutes.js');
const authRoutes = require('./routes/authRoutes.js'); // Импортируем маршруты для аутентификации
const authController = require('./controllers/authController.js'); // Импортируем контроллер для аутентификации
const errorHandler = require('./middleware/errorHandler.js');
const logger = require('./utils/logger');
const path = require('path');
const sequelize = require('./config/db'); // Импортируем конфигурацию базы данных
const cookieParser = require('cookie-parser'); // Импортируем cookie-parser
const http = require('http');
const socketIo = require('socket.io');
const authMiddleware = require('./middleware/authMiddleware'); // Импортируем middleware для проверки аутентификации
require('./utils/scheduler.js');
const cors = require('cors'); // Импортируем пакет cors
const chatRoutes = require('./routes/chatRoutes');
const session = require('express-session');
const i18next = require('./config/i18n');
const i18nextMiddleware = require('i18next-http-middleware');

const app = express();
const server = http.createServer(app); // Создаем HTTP-сервер
const io = socketIo(server); // Интегрируем socket.io
const port = process.env.PORT || 3000;
// После других импортов
const apiRoutes = require('./routes/apiRoutes');

// Настройка загрузки файлов
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Подключение API маршрутов
app.use('/api', apiRoutes);



// Настройка EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: 'secret_startsev',
  resave: false,
  saveUninitialized: true,
}));

app.use(i18nextMiddleware.handle(i18next));

// Настройка Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Middleware для обработки JSON-запросов
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Используем cookie-parser

// Обслуживание статических файлов
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors()); // Используем cors 
app.use(chatRoutes);
// Определение router
const router = express.Router();

// Использование маршрутов
router.use('/events', eventRoutes);
router.use('/', authRoutes); // Используем маршруты для аутентификации

// Обработка ошибок
app.use(errorHandler);

// HTML-страницы
router.get('/', (req, res) => {
  res.render('pages/home');
});

router.get('/login', authController.showLogin);
router.get('/register', authController.showRegister);

router.get('/profile', authController.showProfile);

// Новые формы
app.get('/createEvent', (req, res) => {
  const user = req.user;
  res.render('pages/createEvent', { user });
});

router.get('/registerForEvent', (req, res) => {
  res.render('pages/registerForEvent');
});

router.get('/confirmRegistration', (req, res) => {
  res.render('pages/confirmRegistration');
});

// Добавление маршрута для чата с проверкой аутентификации
router.get('/chat', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// Использование router в приложении
app.use(router);

// Обработка подключения клиентов
io.on('connection', (socket) => {
  console.log('New client connected');

  // Обработка сообщений от клиентов
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg); // Отправляем сообщение всем подключенным клиентам
  });

  // Обработка отключения клиентов
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});
app.get('/change-language/:lng', (req, res) => {
  const { lng } = req.params;
  req.i18n.changeLanguage(lng);
  res.redirect(req.get('referer') || '/'); // Перенаправляем обратно на предыдущую страницу или на главную
});

// Синхронизация базы данных и запуск сервера
sequelize.sync()
  .then(() => {
    logger.info('Database connection has been established successfully.');
    server.listen(port, () => { // Запускаем сервер
      logger.info(`Server is running on port ${port}`);
    });
  })
  .catch(err => {
    logger.error(`Unable to connect to the database: ${err.message}`);
  });