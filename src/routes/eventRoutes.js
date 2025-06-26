// src/routes/eventRoutes.js
const express = require('express');
const eventController = require('../controllers/eventController.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const roleMiddleware = require('../middleware/roleMiddleware.js');

const router = express.Router();

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *                 format: time
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authMiddleware, roleMiddleware('admin'), eventController.createEvent);

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get list of events
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of events retrieved successfully
 */
router.get('/', authMiddleware, eventController.getEvents);

/**
 * @swagger
 * /events/register:
 *   post:
 *     summary: Register for an event
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Registered for event successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/register', authMiddleware, eventController.registerForEvent);

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete an event
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', authMiddleware, roleMiddleware('admin'), eventController.deleteEvent);

module.exports = router;