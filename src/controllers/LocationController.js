// src/controllers/LocationController.js
const LocationService = require('../services/LocationService');
const logger = require('../utils/logger');

class LocationController {
  async getAllLocations(req, res) {
    try {
      const locations = await LocationService.getAllLocations();
      res.json({ success: true, data: locations });
    } catch (error) {
      logger.error(`Ошибка получения мест: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getLocationById(req, res) {
    try {
      const location = await LocationService.getLocationById(parseInt(req.params.id));
      if (!location) {
        return res.status(404).json({ success: false, error: 'Место не найдено' });
      }
      res.json({ success: true, data: location });
    } catch (error) {
      logger.error(`Ошибка получения места: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createLocation(req, res) {
    try {
      const { name, address, city, capacity, description } = req.body;
      
      if (!name || !address || !city) {
        return res.status(400).json({ 
          success: false, 
          error: 'Название, адрес и город обязательны' 
        });
      }

      const location = await LocationService.createLocation(
        name, address, city, capacity, description
      );
      
      logger.info(`Создано новое место: ${name}`);
      res.status(201).json({ success: true, data: location });
    } catch (error) {
      logger.error(`Ошибка создания места: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateLocation(req, res) {
    try {
      const locationId = parseInt(req.params.id);
      const updateData = req.body;
      
      const location = await LocationService.getLocationById(locationId);
      if (!location) {
        return res.status(404).json({ success: false, error: 'Место не найдено' });
      }

      // Проверяем права (только админ или организатор)
      if (req.user.role !== 'admin' && req.user.role !== 'organizer') {
        return res.status(403).json({ 
          success: false, 
          error: 'Недостаточно прав для редактирования места' 
        });
      }

      const updatedLocation = await LocationService.updateLocation(locationId, updateData);
      res.json({ success: true, data: updatedLocation });
    } catch (error) {
      logger.error(`Ошибка обновления места: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteLocation(req, res) {
    try {
      const locationId = parseInt(req.params.id);
      
      // Проверяем права (только админ)
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          error: 'Только администратор может удалять места' 
        });
      }

      const success = await LocationService.deleteLocation(locationId);
      if (success) {
        logger.info(`Удалено место с ID: ${locationId}`);
        res.json({ success: true, message: 'Место успешно удалено' });
      } else {
        res.status(404).json({ success: false, error: 'Место не найдено' });
      }
    } catch (error) {
      logger.error(`Ошибка удаления места: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Для отображения в формах
  async getLocationsForForm(req, res) {
    try {
      const locations = await LocationService.getAllLocations();
      res.render('partials/locationSelect', { locations, selected: req.query.selected });
    } catch (error) {
      logger.error(`Ошибка получения мест для формы: ${error.message}`);
      res.status(500).send('Ошибка загрузки списка мест');
    }
  }
}

module.exports = new LocationController();