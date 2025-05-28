const { Booking, Event, User, sequelize } = require("../models")
const { Op } = require("sequelize")
const AppError = require("../utils/app-error")
const catchAsync = require("../utils/catch-async")

// Dynamic booking validation
const validateBooking = async (eventId, numberOfSeats, userId) => {
  const event = await Event.findByPk(eventId)
  
  if (!event) {
    throw new AppError("Event not found", 404)
  }

  if (event.status !== "upcoming") {
    throw new AppError("Event is not available for booking", 400)
  }

  if (event.availableSeats < numberOfSeats) {
    throw new AppError("Not enough seats available", 400)
  }

  // Check for existing bookings by the same user
  const existingBookings = await Booking.count({
    where: {
      userId,
      eventId,
      status: {
        [Op.in]: ["confirmed", "pending"]
      }
    }
  })

  if (existingBookings > 0) {
    throw new AppError("You already have a booking for this event", 400)
  }

  return event
}

// Sophisticated booking creation with transaction
exports.createBooking = catchAsync(async (req, res, next) => {
  const transaction = await sequelize.transaction()

  try {
    const { eventId, numberOfSeats } = req.body
    const userId = req.user.id

    const event = await validateBooking(eventId, numberOfSeats, userId)

    const totalAmount = event.price * numberOfSeats

    const booking = await Booking.create({
      userId,
      eventId,
      numberOfSeats,
      totalAmount,
      status: "confirmed",
      bookingDate: new Date()
    }, { transaction })

    // Update event available seats
    await event.update({
      availableSeats: event.availableSeats - numberOfSeats
    }, { transaction })

    await transaction.commit()

    // Fetch booking with related data
    const bookingWithDetails = await Booking.findByPk(booking.id, {
      include: [
        {
          model: Event,
          attributes: ["title", "startDate", "location"]
        },
        {
          model: User,
          attributes: ["firstName", "lastName", "email"]
        }
      ]
    })

    res.status(201).json({
      status: "success",
      data: { booking: bookingWithDetails }
    })
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
})

// Enhanced booking retrieval with dynamic filtering
exports.getMyBookings = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const offset = (page - 1) * limit

  const filters = {
    userId: req.user.id,
    ...(req.query.status && { status: req.query.status }),
    ...(req.query.startDate && req.query.endDate && {
      bookingDate: {
        [Op.between]: [new Date(req.query.startDate), new Date(req.query.endDate)]
      }
    })
  }

  const { count, rows: bookings } = await Booking.findAndCountAll({
    where: filters,
    order: [["bookingDate", "DESC"]],
    limit,
    offset,
    include: [
      {
        model: Event,
        attributes: ["title", "startDate", "location", "price"]
      }
    ]
  })

  res.status(200).json({
    status: "success",
    results: count,
    data: { bookings },
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    }
  })
})

// Sophisticated booking cancellation with validation
exports.cancelBooking = catchAsync(async (req, res, next) => {
  const transaction = await sequelize.transaction()

  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [Event]
    })

    if (!booking) {
      return next(new AppError("Booking not found", 404))
    }

    if (booking.userId !== req.user.id && req.user.role !== "admin") {
      return next(new AppError("Not authorized to cancel this booking", 403))
    }

    if (booking.status !== "confirmed") {
      return next(new AppError("Only confirmed bookings can be cancelled", 400))
    }

    // Check if event is in the future
    if (new Date(booking.Event.startDate) <= new Date()) {
      return next(new AppError("Cannot cancel booking for past events", 400))
    }

    await booking.update({
      status: "cancelled",
      cancelledAt: new Date()
    }, { transaction })

    // Update event available seats
    await booking.Event.update({
      availableSeats: booking.Event.availableSeats + booking.numberOfSeats
    }, { transaction })

    await transaction.commit()

    res.status(200).json({
      status: "success",
      data: { booking }
    })
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
})

// Enhanced booking statistics with detailed analytics
exports.getBookingStats = catchAsync(async (req, res, next) => {
  const stats = await Booking.findAll({
    attributes: [
      "status",
      [sequelize.fn("COUNT", sequelize.col("id")), "totalBookings"],
      [sequelize.fn("SUM", sequelize.col("numberOfSeats")), "totalSeats"],
      [sequelize.fn("SUM", sequelize.col("totalAmount")), "totalRevenue"],
      [sequelize.fn("AVG", sequelize.col("totalAmount")), "averageBookingValue"]
    ],
    group: ["status"],
    include: [{
      model: Event,
      attributes: ["category"],
      required: true
    }],
    order: [[sequelize.fn("COUNT", sequelize.col("id")), "DESC"]]
  })

  // Calculate additional metrics
  const totalBookings = stats.reduce((sum, stat) => sum + parseInt(stat.getDataValue("totalBookings")), 0)
  const totalRevenue = stats.reduce((sum, stat) => sum + parseFloat(stat.getDataValue("totalRevenue")), 0)

  const enhancedStats = {
    byStatus: stats,
    summary: {
      totalBookings,
      totalRevenue,
      averageRevenuePerBooking: totalRevenue / totalBookings
    }
  }

  res.status(200).json({
    status: "success",
    data: { stats: enhancedStats }
  })
})

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  getBookingStats,
}
