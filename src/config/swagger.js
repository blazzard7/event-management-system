const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const config = require('./index');

const specs = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: `${config.app.name} API`,
      version: '3.0.0'
    }
  },
  apis: []
});

module.exports = { swaggerUi, specs };
