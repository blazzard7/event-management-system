// src/middleware/roleMiddleware.js
const logger = require('../utils/logger');

const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      if (user.role !== requiredRole) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      next();
    } catch (error) {
      logger.error(`Role check error: ${error.message}`, { stack: error.stack });
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
};

module.exports = roleMiddleware;