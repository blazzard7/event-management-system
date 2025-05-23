const express = require('express');
const commentController = require('../controllers/commentController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/comments', authMiddleware, commentController.addComment);
router.get('/comments/:eventId', authMiddleware, commentController.getComments);

module.exports = router;