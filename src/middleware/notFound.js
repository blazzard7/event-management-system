module.exports = (req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: 'Route not found' });
  }

  return res.status(404).render('pages/error', {
    title: 'Not found',
    currentUser: req.currentUser || null,
    message: 'Page not found.'
  });
};
