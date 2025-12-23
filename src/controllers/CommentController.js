// src/controllers/CommentController.js
const CommentService = require('../services/CommentService');
const logger = require('../utils/logger');

class CommentController {
  async getEventComments(req, res) {
    try {
      const eventId = parseInt(req.params.eventId);
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const result = await CommentService.getCommentsByEvent(eventId, page, limit);
      
      // Если запрос API
      if (req.accepts('json')) {
        return res.json({ success: true, data: result });
      }
      
      // Если запрос для страницы
      res.render('partials/commentsList', {
        comments: result.comments,
        pagination: {
          currentPage: page,
          totalPages: result.totalPages,
          total: result.total
        }
      });
    } catch (error) {
      logger.error(`Ошибка получения комментариев: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createComment(req, res) {
    try {
      const { eventId, text, rating } = req.body;
      
      if (!eventId || !text) {
        return res.status(400).json({ 
          success: false, 
          error: 'ID события и текст комментария обязательны' 
        });
      }
      
      // Проверяем, зарегистрирован ли пользователь на событие
      // TODO: Добавить проверку регистрации
      
      const comment = await CommentService.createComment(
        req.user.id,
        parseInt(eventId),
        text,
        rating
      );
      
      logger.info(`Пользователь ${req.user.id} оставил комментарий к событию ${eventId}`);
      res.status(201).json({ success: true, data: comment });
    } catch (error) {
      logger.error(`Ошибка создания комментария: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateComment(req, res) {
    try {
      const commentId = parseInt(req.params.id);
      const updateData = req.body;
      
      const comment = await CommentService.updateComment(commentId, req.user.id, updateData);
      res.json({ success: true, data: comment });
    } catch (error) {
      logger.error(`Ошибка обновления комментария: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteComment(req, res) {
    try {
      const commentId = parseInt(req.params.id);
      const isAdmin = req.user.role === 'admin';
      
      const success = await CommentService.deleteComment(commentId, req.user.id, isAdmin);
      if (success) {
        res.json({ success: true, message: 'Комментарий успешно удален' });
      } else {
        res.status(404).json({ success: false, error: 'Комментарий не найден' });
      }
    } catch (error) {
      logger.error(`Ошибка удаления комментария: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getEventRating(req, res) {
    try {
      const eventId = parseInt(req.params.eventId);
      const rating = await CommentService.getEventAverageRating(eventId);
      res.json({ success: true, data: rating });
    } catch (error) {
      logger.error(`Ошибка получения рейтинга события: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new CommentController();