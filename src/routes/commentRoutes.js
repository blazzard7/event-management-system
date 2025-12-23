// src/routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/CommentController');
const authMiddleware = require('../middleware/authMiddleware');

// Публичные маршруты
router.get('/event/:eventId', CommentController.getEventComments);
router.get('/event/:eventId/rating', CommentController.getEventRating);

// Защищенные маршруты
router.post('/', authMiddleware, CommentController.createComment);
router.put('/:id', authMiddleware, CommentController.updateComment);
router.delete('/:id', authMiddleware, CommentController.deleteComment);

module.exports = router;