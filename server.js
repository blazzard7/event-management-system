const express = require('express');
const { swaggerUi, specs } = require('./swagger/swaggerConfig.js'); 
const eventRoutes = require('./src/routes/eventRoutes.js'); 

const app = express();
const port = process.env.PORT || 3000;

// Настройка Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Использование маршрутов
app.use('/api', eventRoutes);

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});