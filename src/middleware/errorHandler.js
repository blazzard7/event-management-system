const { fail } = require('../lib/http');
const logger = require('../lib/logger');

module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  logger.error('Request failed', {
    status,
    method: req.method,
    url: req.originalUrl,
    message: err.message
  });

  if (req.originalUrl.startsWith('/api/')) {
    return fail(res, status, err.message || 'Internal server error', err.details || null);
  }

  return res.status(status).render('pages/error', {
    title: 'Error',
    currentUser: req.currentUser || null,
    message: err.message || 'Internal server error'
  });
};
