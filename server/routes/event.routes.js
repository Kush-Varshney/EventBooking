const express = require("express")
const eventController = require("../controllers/event.controller")
const { authenticate, authorize, optionalAuth } = require("../middleware/auth")
const {
  validate,
  validateQuery,
  eventSchema,
  eventUpdateSchema,
  eventQuerySchema,
} = require("../middleware/validation")

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - dateTime
 *         - location
 *         - totalSeats
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated id of the event
 *         title:
 *           type: string
 *           description: The event title
 *         description:
 *           type: string
 *           description: The event description
 *         dateTime:
 *           type: string
 *           format: date-time
 *           description: The event date and time
 *         location:
 *           type: string
 *           description: The event location
 *         totalSeats:
 *           type: integer
 *           description: Total number of seats
 *         availableSeats:
 *           type: integer
 *           description: Number of available seats
 *         price:
 *           type: number
 *           format: float
 *           description: Ticket price
 *         isActive:
 *           type: boolean
 *           description: Whether the event is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/events:
 *   get:
 *     summary: Get all events with filtering and pagination
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of events per page
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter events from this date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter events until this date
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, description, and location
 *     responses:
 *       200:
 *         description: List of events retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 results:
 *                   type: integer
 *                 pagination:
 *                   type: object
 *                 data:
 *                   type: object
 *                   properties:
 *                     events:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
 */
router.get("/", validateQuery(eventQuerySchema), optionalAuth, eventController.getAllEvents)

/**
 * @swagger
 * /api/v1/events/stats:
 *   get:
 *     summary: Get event statistics
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 */
router.get("/stats", authenticate, authorize("admin"), eventController.getEventStats)

/**
 * @swagger
 * /api/v1/events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     event:
 *                       $ref: '#/components/schemas/Event'
 */
router.get("/:id", optionalAuth, eventController.getEvent)

/**
 * @swagger
 * /api/v1/events:
 *   post:
 *     summary: Create a new event (Admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - dateTime
 *               - location
 *               - totalSeats
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dateTime:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               totalSeats:
 *                 type: integer
 *               price:
 *                 type: number
 *                 format: float
 *     responses:
 *       201:
 *         description: Event created successfully
 */
router.post("/", authenticate, authorize("admin"), validate(eventSchema), eventController.createEvent)

/**
 * @swagger
 * /api/v1/events/{id}:
 *   patch:
 *     summary: Update event (Admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Event ID
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
 *               dateTime:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               totalSeats:
 *                 type: integer
 *               price:
 *                 type: number
 *                 format: float
 *     responses:
 *       200:
 *         description: Event updated successfully
 */
router.patch("/:id", authenticate, authorize("admin"), validate(eventUpdateSchema), eventController.updateEvent)

/**
 * @swagger
 * /api/v1/events/{id}:
 *   delete:
 *     summary: Delete event (Admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Event ID
 *     responses:
 *       204:
 *         description: Event deleted successfully
 */
router.delete("/:id", authenticate, authorize("admin"), eventController.deleteEvent)

module.exports = router
