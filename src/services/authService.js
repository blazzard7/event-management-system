// src/services/authService.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database'); // Импортируем пул соединений

class AuthService {
  async register(email, password, firstName, lastName, phone, role = 'user') {
    // Проверка, существует ли пользователь с таким email
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      throw new Error('Пользователь с таким email уже существует');
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание нового пользователя (прямой SQL-запрос)
    const [result] = await pool.execute(
      `INSERT INTO users 
       (email, password_hash, first_name, last_name, phone, role) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, firstName, lastName, phone, role]
    );

    return {
      id: result.insertId,
      email,
      first_name: firstName,
      last_name: lastName,
      role
    };
  }

  async login(email, password) {
    // Поиск пользователя по email
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      throw new Error('Неверный email или пароль');
    }

    const user = users[0];

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Неверный email или пароль');
    }

    // Генерация JWT-токена
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name
      }, 
      process.env.JWT_SECRET || 'your-secret-key', // Добавьте в .env JWT_SECRET
      { expiresIn: '1h' }
    );

    return { token, user: { ...user, password_hash: undefined } };
  }
}

module.exports = new AuthService();