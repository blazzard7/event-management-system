const CommentService = require('../services/commentService.js');
const CommentView = require('../views/commentView.js');

class CommentController {
  async addComment(req, res) {
    try {
      const { content, eventId } = req.body;
      const comment = await CommentService.addComment(content, eventId, req.user.userId);
      CommentView.renderSuccess(res, comment);
    } catch (error) {
      CommentView.renderError(res, error.message);
    }
  }

  async getComments(req, res) {
    try {
      const { eventId } = req.params;
      const comments = await CommentService.getComments(eventId);
      CommentView.renderSuccess(res, comments);
    } catch (error) {
      CommentView.renderError(res, error.message);
    }
  }
}

module.exports = new CommentController();