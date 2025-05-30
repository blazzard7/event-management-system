// server/src/controllers/commentController.js
const CommentService = require('../services/commentService.js');

class CommentController {
  async addComment(req, res) {
    try {
      const { content, eventId } = req.body;
      await CommentService.addComment(content, eventId, req.user.userId);
      res.redirect(`/events/${eventId}`);
    } catch (error) {
      res.render('pages/event', { error: error.message });
    }
  }

  async getComments(req, res) {
    try {
      const { eventId } = req.params;
      const comments = await CommentService.getComments(eventId);
      res.render('pages/event', { comments });
    } catch (error) {
      res.render('pages/event', { error: error.message });
    }
  }
}

module.exports = new CommentController();