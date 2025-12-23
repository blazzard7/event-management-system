// src/services/CategoryService.js
const pool = require('../config/database');

class CategoryService {
  async getAllCategories() {
    const [rows] = await pool.execute(`
      SELECT c.*, 
             COUNT(ec.event_id) as event_count,
             parent.name as parent_name
      FROM categories c
      LEFT JOIN event_categories ec ON c.id = ec.category_id
      LEFT JOIN categories parent ON c.parent_id = parent.id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    return rows;
  }

  async getCategoryById(id) {
    const [rows] = await pool.execute(`
      SELECT c.*, parent.name as parent_name
      FROM categories c
      LEFT JOIN categories parent ON c.parent_id = parent.id
      WHERE c.id = ?
    `, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  async getCategoriesByEvent(eventId) {
    const [rows] = await pool.execute(`
      SELECT c.* 
      FROM categories c
      JOIN event_categories ec ON c.id = ec.category_id
      WHERE ec.event_id = ?
    `, [eventId]);
    return rows;
  }

  async createCategory(name, description = null, parentId = null) {
    const [result] = await pool.execute(
      `INSERT INTO categories (name, description, parent_id) 
       VALUES (?, ?, ?)`,
      [name, description, parentId]
    );
    
    return { id: result.insertId, name, description, parent_id: parentId };
  }

  async updateCategory(id, updateData) {
    const updates = [];
    const values = [];
    
    const allowedFields = ['name', 'description', 'parent_id'];
    
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (updates.length === 0) {
      throw new Error('Нет данных для обновления');
    }
    
    values.push(id);
    const query = `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`;
    
    await pool.execute(query, values);
    return this.getCategoryById(id);
  }

  async deleteCategory(id) {
    // Проверяем, есть ли у категории дочерние категории
    const [children] = await pool.execute(
      'SELECT id FROM categories WHERE parent_id = ?',
      [id]
    );
    
    if (children.length > 0) {
      throw new Error('Нельзя удалить категорию, у которой есть дочерние категории');
    }
    
    // Удаляем связи с событиями
    await pool.execute(
      'DELETE FROM event_categories WHERE category_id = ?',
      [id]
    );
    
    // Удаляем категорию
    const [result] = await pool.execute(
      'DELETE FROM categories WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }

  async addCategoryToEvent(eventId, categoryId) {
    const [result] = await pool.execute(
      `INSERT INTO event_categories (event_id, category_id) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE event_id = event_id`,
      [eventId, categoryId]
    );
    return result.affectedRows > 0;
  }

  async removeCategoryFromEvent(eventId, categoryId) {
    const [result] = await pool.execute(
      'DELETE FROM event_categories WHERE event_id = ? AND category_id = ?',
      [eventId, categoryId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new CategoryService();