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

module.exports = router;