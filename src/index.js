// src/index.js
const express = require('express');
const { swaggerUi, specs } = require('../swagger/swaggerConfig.js');
const eventRoutes = require('./routes/eventRoutes.js');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Настройка EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Настройка Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Использование маршрутов
app.use('/api', eventRoutes);


// HTML-страницы
app.get('/', (req, res) => {
  res.render('pages/home', { title: 'Home' });
});

app.get('/events', (req, res) => {
  res.render('pages/events', { title: 'Events' });
});

app.get('/login', (req, res) => {
  res.render('pages/login', { title: 'Login' });
});

app.get('/register', (req, res) => {
  res.render('pages/register', { title: 'Register' });
});

app.get('/profile', (req, res) => {
  res.render('pages/profile', { title: 'Profile', user: req.user });
});

// Новые формы
app.get('/createEvent', (req, res) => {
  res.render('pages/createEvent', { title: 'Create Event' });
});

app.get('/registerForEvent', (req, res) => {
  res.render('pages/registerForEvent', { title: 'Register for Event' });
});

app.get('/confirmRegistration', (req, res) => {
  res.render('pages/confirmRegistration', { title: 'Confirm Registration' });
});
// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});