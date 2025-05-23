const Comment = require('../models/comment.js');
const User = require('../models/user.js');
const Event = require('../models/event.js');

class CommentService {
  async addComment(content, eventId, userId) {
    const comment = await Comment.create({ content, eventId, userId });
    return comment;
  }

  async getComments(eventId) {
    const comments = await Comment.findAll({
      where: { eventId },
      include: [User],
    });
    return comments;
  }
}

module.exports = new CommentService();