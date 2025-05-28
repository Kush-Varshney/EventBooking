const express = require("express")
const bookingController = require("../controllers/booking.controller")
const { authenticate, authorize } = require("../middleware/auth")
const { validate, bookingSchema } = require("../middleware/validation")
const { bookingLimiter } = require("../middleware/rate-limiter")

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - userId
 *         - eventId
 *         - numberOfSeats
 *         - totalAmount
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated id of the booking
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The user who made the booking
 *         eventId:
 *           type: string
 *           format: uuid
 *           description: The event being booked
 *         numberOfSeats:
 *           type: integer
 *           description: Number of seats booked
 *         totalAmount:
 *           type: number
 *           format: float
 *           description: Total amount paid
 *         status:
 *           type: string
 *           enum: [confirmed, cancelled, pending]
 *           description: Booking status
 *         bookingDate:
 *           type: string
 *           format: date-time
 *           description: When the booking was made
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// All routes require authentication
router.use(authenticate)

/**
 * @swagger
 * /api/v1/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *             properties:
 *               eventId:
 *                 type: string
 *                 format: uuid
 *               numberOfSeats:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 default: 1
 *     responses:
 *       201:
 *         description: Booking created successfully
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
 *                     booking:
 *                       $ref: '#/components/schemas/Booking'
 */
router.post("/", bookingLimiter, validate(bookingSchema), bookingController.createBooking)

/**
 * @swagger
 * /api/v1/bookings/my-bookings:
 *   get:
 *     summary: Get current user's bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 results:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookings:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Booking'
 */
router.get("/my-bookings", bookingController.getMyBookings)

/**
 * @swagger
 * /api/v1/bookings/stats:
 *   get:
 *     summary: Get booking statistics (Admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Booking statistics retrieved successfully
 */
router.get("/stats", authorize("admin"), bookingController.getBookingStats)

/**
 * @swagger
 * /api/v1/bookings/all:
 *   get:
 *     summary: Get all bookings (Admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
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
 *         description: Number of bookings per page
 *     responses:
 *       200:
 *         description: All bookings retrieved successfully
 */
router.get("/all", authorize("admin"), bookingController.getAllBookings)

/**
 * @swagger
 * /api/v1/bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 */
router.get("/:id", bookingController.getBooking)

/**
 * @swagger
 * /api/v1/bookings/{id}/cancel:
 *   patch:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 */
router.patch("/:id/cancel", bookingController.cancelBooking)

module.exports = router
