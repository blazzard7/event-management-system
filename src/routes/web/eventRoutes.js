const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const eventController = require('../../controllers/eventController');
const { requireAuth, requireAdmin } = require('../../middleware/auth');

const router = express.Router();
router.get('/', asyncHandler(eventController.home));
router.get('/my-events', requireAuth, asyncHandler(eventController.myEvents));
router.get('/events/new', requireAuth, asyncHandler(eventController.showCreateForm));
router.post('/events', requireAuth, asyncHandler(eventController.createWeb));
router.get('/events/join', asyncHandler(eventController.joinByInvitation));
router.post('/events/join', asyncHandler(eventController.joinByInvitation));
router.get('/events/:id', asyncHandler(eventController.eventDetails));
router.get('/events/:id/edit', requireAuth, asyncHandler(eventController.showEditForm));
router.post('/events/:id', requireAuth, asyncHandler(eventController.updateWeb));
router.post('/events/:id/delete', requireAuth, asyncHandler(eventController.deleteWeb));
router.post('/events/:id/register', requireAuth, asyncHandler(eventController.registerWeb));
router.post('/events/:id/unregister', requireAuth, asyncHandler(eventController.unregisterWeb));
router.post('/events/:id/comments', requireAuth, asyncHandler(eventController.addCommentWeb));
router.get('/admin/events/new', requireAuth, asyncHandler(eventController.showCreateForm));
router.post('/admin/events', requireAuth, asyncHandler(eventController.createWeb));
router.get('/admin/events/:id/edit', requireAuth, requireAdmin, asyncHandler(eventController.showEditForm));
router.post('/admin/events/:id', requireAuth, requireAdmin, asyncHandler(eventController.updateWeb));
router.post('/admin/events/:id/delete', requireAuth, requireAdmin, asyncHandler(eventController.deleteWeb));

module.exports = router;
