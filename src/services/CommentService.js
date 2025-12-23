// src/services/CommentService.js
const pool = require('../config/database');

class CommentService {
  async getCommentsByEvent(eventId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const [rows] = await pool.execute(`
      SELECT c.*, 
             u.email as user_email,
             u.first_name as user_first_name,
             u.last_name as user_last_name
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.event_id = ?
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `, [eventId, limit, offset]);
    
    // Получаем общее количество
    const [countRows] = await pool.execute(
      'SELECT COUNT(*) as total FROM comments WHERE event_id = ?',
      [eventId]
    );
    
    return {
      comments: rows,
      total: countRows[0].total,
      page,
      totalPages: Math.ceil(countRows[0].total / limit)
    };
  }

  async getCommentById(id) {
    const [rows] = await pool.execute(`
      SELECT c.*, 
             u.email as user_email,
             u.first_name as user_first_name,
             u.last_name as user_last_name
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  async createComment(userId, eventId, text, rating = null) {
    // Проверяем, оставлял ли пользователь уже комментарий к этому событию
    const [existing] = await pool.execute(
      'SELECT id FROM comments WHERE user_id = ? AND event_id = ?',
      [userId, eventId]
    );
    
    if (existing.length > 0) {
      throw new Error('Вы уже оставляли комментарий к этому событию');
    }
    
    const [result] = await pool.execute(
      `INSERT INTO comments (user_id, event_id, text, rating) 
       VALUES (?, ?, ?, ?)`,
      [userId, eventId, text, rating]
    );
    
    return { id: result.insertId, user_id: userId, event_id: eventId, text, rating };
  }

  async updateComment(id, userId, updateData) {
    // Проверяем, принадлежит ли комментарий пользователю
    const comment = await this.getCommentById(id);
    if (!comment) {
      throw new Error('Комментарий не найден');
    }
    
    if (comment.user_id !== userId) {
      throw new Error('Вы не можете редактировать этот комментарий');
    }
    
    const updates = [];
    const values = [];
    
    if (updateData.text !== undefined) {
      updates.push('text = ?');
      values.push(updateData.text);
    }
    
    if (updateData.rating !== undefined) {
      updates.push('rating = ?');
      values.push(updateData.rating);
    }
    
    if (updates.length === 0) {
      throw new Error('Нет данных для обновления');
    }
    
    values.push(id);
    const query = `UPDATE comments SET ${updates.join(', ')} WHERE id = ?`;
    
    await pool.execute(query, values);
    return this.getCommentById(id);
  }

  async deleteComment(id, userId, isAdmin = false) {
    // Проверяем права доступа
    const comment = await this.getCommentById(id);
    if (!comment) {
      throw new Error('Комментарий не найден');
    }
    
    if (comment.user_id !== userId && !isAdmin) {
      throw new Error('Вы не можете удалить этот комментарий');
    }
    
    const [result] = await pool.execute(
      'DELETE FROM comments WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }

  async getEventAverageRating(eventId) {
    const [rows] = await pool.execute(`
      SELECT 
        COUNT(*) as total_comments,
        AVG(rating) as average_rating
      FROM comments 
      WHERE event_id = ? AND rating IS NOT NULL
    `, [eventId]);
    
    return rows.length > 0 ? rows[0] : { total_comments: 0, average_rating: null };
  }
}

module.exports = new CommentService();