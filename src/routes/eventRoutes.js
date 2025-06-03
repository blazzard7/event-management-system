// src/routes/eventRoutes.js
const express = require('express');
const eventController = require('../controllers/eventController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = express.Router();

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Retrieve a list of events
 *     responses:
 *       200:
 *         description: A list of events.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 */
router.get('/events', authMiddleware, eventController.getEvents);

/**
 * @swagger
 * /api/events/{eventId}:
 *   get:
 *     summary: Retrieve a single event by ID
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: The event ID
 *     responses:
 *       200:
 *         description: A single event.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 */
router.get('/events/:eventId', authMiddleware, eventController.getEvent);

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: The event was successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 */
router.post('/events', authMiddleware, eventController.createEvent);

/**
 * @swagger
 * /api/events/register:
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
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully registered for the event.
 */
router.post('/events/register', authMiddleware, eventController.registerForEvent);

/**
 * @swagger
 * /api/events/confirm/{registrationId}:
 *   put:
 *     summary: Confirm a registration
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         schema:
 *           type: string
 *         required: true
 *         description: The registration ID
 *     responses:
 *       200:
 *         description: The registration was successfully confirmed.
 */
router.put('/events/confirm/:registrationId', authMiddleware, eventController.confirmRegistration);

module.exports = router;