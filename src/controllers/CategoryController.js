// src/controllers/CategoryController.js
const CategoryService = require('../services/CategoryService');
const logger = require('../utils/logger');

class CategoryController {
  async getAllCategories(req, res) {
    try {
      const categories = await CategoryService.getAllCategories();
      res.json({ success: true, data: categories });
    } catch (error) {
      logger.error(`Ошибка получения категорий: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getCategoryById(req, res) {
    try {
      const category = await CategoryService.getCategoryById(parseInt(req.params.id));
      if (!category) {
        return res.status(404).json({ success: false, error: 'Категория не найдена' });
      }
      res.json({ success: true, data: category });
    } catch (error) {
      logger.error(`Ошибка получения категории: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getCategoriesByEvent(req, res) {
    try {
      const categories = await CategoryService.getCategoriesByEvent(parseInt(req.params.eventId));
      res.json({ success: true, data: categories });
    } catch (error) {
      logger.error(`Ошибка получения категорий события: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createCategory(req, res) {
    try {
      const { name, description, parent_id } = req.body;
      
      if (!name) {
        return res.status(400).json({ 
          success: false, 
          error: 'Название категории обязательно' 
        });
      }

      // Проверяем права (только админ)
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          error: 'Только администратор может создавать категории' 
        });
      }

      const category = await CategoryService.createCategory(name, description, parent_id);
      
      logger.info(`Создана новая категория: ${name}`);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      logger.error(`Ошибка создания категории: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateCategory(req, res) {
    try {
      const categoryId = parseInt(req.params.id);
      
      // Проверяем права (только админ)
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          error: 'Только администратор может редактировать категории' 
        });
      }

      const updatedCategory = await CategoryService.updateCategory(categoryId, req.body);
      res.json({ success: true, data: updatedCategory });
    } catch (error) {
      logger.error(`Ошибка обновления категории: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteCategory(req, res) {
    try {
      const categoryId = parseInt(req.params.id);
      
      // Проверяем права (только админ)
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          error: 'Только администратор может удалять категории' 
        });
      }

      const success = await CategoryService.deleteCategory(categoryId);
      if (success) {
        logger.info(`Удалена категория с ID: ${categoryId}`);
        res.json({ success: true, message: 'Категория успешно удалена' });
      } else {
        res.status(404).json({ success: false, error: 'Категория не найдена' });
      }
    } catch (error) {
      logger.error(`Ошибка удаления категории: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Для отображения в формах
  async getCategoriesForForm(req, res) {
    try {
      const categories = await CategoryService.getAllCategories();
      const selected = req.query.selected ? req.query.selected.split(',') : [];
      res.render('partials/categorySelect', { categories, selected });
    } catch (error) {
      logger.error(`Ошибка получения категорий для формы: ${error.message}`);
      res.status(500).send('Ошибка загрузки списка категорий');
    }
  }

  async addCategoryToEvent(req, res) {
    try {
      const { eventId, categoryId } = req.params;
      
      // Проверяем права (организатор события или админ)
      // TODO: Проверить, является ли пользователь организатором события
      
      const success = await CategoryService.addCategoryToEvent(
        parseInt(eventId), 
        parseInt(categoryId)
      );
      
      if (success) {
        res.json({ success: true, message: 'Категория добавлена к событию' });
      } else {
        res.status(400).json({ success: false, error: 'Не удалось добавить категорию' });
      }
    } catch (error) {
      logger.error(`Ошибка добавления категории к событию: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async removeCategoryFromEvent(req, res) {
    try {
      const { eventId, categoryId } = req.params;
      
      const success = await CategoryService.removeCategoryFromEvent(
        parseInt(eventId), 
        parseInt(categoryId)
      );
      
      if (success) {
        res.json({ success: true, message: 'Категория удалена из события' });
      } else {
        res.status(400).json({ success: false, error: 'Не удалось удалить категорию' });
      }
    } catch (error) {
      logger.error(`Ошибка удаления категории из события: ${error.message}`);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new CategoryController();