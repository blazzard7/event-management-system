const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const adminController = require('../../controllers/adminController');
const { requireAuth, requireAdmin } = require('../../middleware/auth');

const router = express.Router();

router.get(
  '/admin/users',
  requireAuth,
  requireAdmin,
  asyncHandler(adminController.usersPage)
);

router.post(
  '/admin/users/:id/role',
  requireAuth,
  requireAdmin,
  asyncHandler(adminController.updateUserRole)
);

router.get(
  '/admin/categories',
  requireAuth,
  requireAdmin,
  asyncHandler(adminController.categoriesPage)
);

router.post(
  '/admin/categories',
  requireAuth,
  requireAdmin,
  asyncHandler(adminController.createCategory)
);

router.post(
  '/admin/categories/:id/delete',
  requireAuth,
  requireAdmin,
  asyncHandler(adminController.deleteCategory)
);

router.get(
  '/admin/locations',
  requireAuth,
  requireAdmin,
  asyncHandler(adminController.locationsPage)
);

router.post(
  '/admin/locations',
  requireAuth,
  requireAdmin,
  asyncHandler(adminController.createLocation)
);

router.post(
  '/admin/locations/:id/delete',
  requireAuth,
  requireAdmin,
  asyncHandler(adminController.deleteLocation)
);

module.exports = router;