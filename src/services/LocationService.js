// src/services/LocationService.js
const pool = require('../config/database');

class LocationService {
  async getAllLocations() {
    const [rows] = await pool.execute(
      'SELECT * FROM locations ORDER BY name ASC'
    );
    return rows;
  }

  async getLocationById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM locations WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  async createLocation(name, address, city, capacity = null, description = null) {
    const [result] = await pool.execute(
      `INSERT INTO locations (name, address, city, capacity, description) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, address, city, capacity, description]
    );
    
    return { id: result.insertId, name, address, city, capacity, description };
  }

  async updateLocation(id, updateData) {
    const updates = [];
    const values = [];
    
    const allowedFields = ['name', 'address', 'city', 'capacity', 'description'];
    
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
    const query = `UPDATE locations SET ${updates.join(', ')} WHERE id = ?`;
    
    await pool.execute(query, values);
    return this.getLocationById(id);
  }

  async deleteLocation(id) {
    const [result] = await pool.execute(
      'DELETE FROM locations WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  async searchLocations(city = null, minCapacity = null) {
    let query = 'SELECT * FROM locations WHERE 1=1';
    const params = [];
    
    if (city) {
      query += ' AND city = ?';
      params.push(city);
    }
    
    if (minCapacity) {
      query += ' AND capacity >= ?';
      params.push(minCapacity);
    }
    
    query += ' ORDER BY name ASC';
    
    const [rows] = await pool.execute(query, params);
    return rows;
  }
}

module.exports = new LocationService();