// src/services/AttachmentService.js
const pool = require('../config/database');

class AttachmentService {
  async getEventAttachments(eventId) {
    const [rows] = await pool.execute(
      'SELECT * FROM attachments WHERE event_id = ? ORDER BY uploaded_at DESC',
      [eventId]
    );
    return rows;
  }

  async getAttachmentById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM attachments WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  async createAttachment(eventId, fileName, filePath, fileSize, mimeType) {
    const [result] = await pool.execute(
      `INSERT INTO attachments (event_id, file_name, file_path, file_size, mime_type) 
       VALUES (?, ?, ?, ?, ?)`,
      [eventId, fileName, filePath, fileSize, mimeType]
    );
    
    return { 
      id: result.insertId, 
      event_id: eventId, 
      file_name: fileName, 
      file_path: filePath,
      file_size: fileSize,
      mime_type: mimeType
    };
  }

  async deleteAttachment(id) {
    // Сначала получаем информацию о файле, чтобы можно было удалить его с диска
    const attachment = await this.getAttachmentById(id);
    if (!attachment) {
      throw new Error('Вложение не найдено');
    }
    
    // Удаляем запись из БД
    const [result] = await pool.execute(
      'DELETE FROM attachments WHERE id = ?',
      [id]
    );
    
    return {
      success: result.affectedRows > 0,
      attachment // Возвращаем данные о файле для удаления с диска
    };
  }

  async getTotalSizeByEvent(eventId) {
    const [rows] = await pool.execute(
      'SELECT SUM(file_size) as total_size FROM attachments WHERE event_id = ?',
      [eventId]
    );
    return rows[0].total_size || 0;
  }
}

module.exports = new AttachmentService();