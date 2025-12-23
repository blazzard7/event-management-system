// src/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/CategoryController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Публичные маршруты
router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);
router.get('/event/:eventId', CategoryController.getCategoriesByEvent);

// Защищенные маршруты (только админ)
router.post('/', authMiddleware, roleMiddleware('admin'), CategoryController.createCategory);
router.put('/:id', authMiddleware, roleMiddleware('admin'), CategoryController.updateCategory);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), CategoryController.deleteCategory);

// Маршруты для связей с событиями
router.post('/event/:eventId/add/:categoryId', authMiddleware, roleMiddleware('admin'), CategoryController.addCategoryToEvent);
router.delete('/event/:eventId/remove/:categoryId', authMiddleware, roleMiddleware('admin'), CategoryController.removeCategoryFromEvent);

// Маршрут для форм (выбор категорий)
router.get('/form/select', CategoryController.getCategoriesForForm);

module.exports = router;