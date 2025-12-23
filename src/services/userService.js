// src/services/userService.js
const bcrypt = require('bcrypt');
const pool = require('../config/database');

class UserService {
  async getProfile(userId) {
    const [users] = await pool.execute(
      `SELECT id, email, first_name, last_name, phone, role, created_at 
       FROM users WHERE id = ?`,
      [userId]
    );
    
    if (users.length === 0) {
      throw new Error('Пользователь не найден');
    }
    
    return users[0];
  }

  async updateProfile(userId, updateData) {
    // Получаем текущего пользователя
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      throw new Error('Пользователь не найден');
    }

    const user = users[0];
    const updates = [];
    const values = [];

    // Формируем поля для обновления
    if (updateData.email && updateData.email !== user.email) {
      // Проверяем, не занят ли email другим пользователем
      const [existing] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [updateData.email, userId]
      );
      
      if (existing.length > 0) {
        throw new Error('Email уже используется другим пользователем');
      }
      
      updates.push('email = ?');
      values.push(updateData.email);
    }

    if (updateData.first_name) {
      updates.push('first_name = ?');
      values.push(updateData.first_name);
    }

    if (updateData.last_name) {
      updates.push('last_name = ?');
      values.push(updateData.last_name);
    }

    if (updateData.phone) {
      updates.push('phone = ?');
      values.push(updateData.phone);
    }

    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      updates.push('password_hash = ?');
      values.push(hashedPassword);
    }

    // Если есть что обновлять
    if (updates.length > 0) {
      values.push(userId); // Добавляем userId в конец для WHERE
      
      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      await pool.execute(query, values);
    }

    // Возвращаем обновленные данные
    return this.getProfile(userId);
  }

  async getUserById(userId) {
    const [users] = await pool.execute(
      `SELECT id, email, first_name, last_name, role, created_at 
       FROM users WHERE id = ?`,
      [userId]
    );
    
    return users.length > 0 ? users[0] : null;
  }

  async getUserByEmail(email) {
    const [users] = await pool.execute(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );
    
    return users.length > 0 ? users[0] : null;
  }
}

module.exports = new UserService();