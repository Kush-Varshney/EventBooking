const { Event, User, Booking, sequelize } = require("../models")
const { Op } = require("sequelize")
const AppError = require("../utils/app-error")
const catchAsync = require("../utils/catch-async")
const APIFeatures = require("../utils/api-features")

// Dynamic event filtering and sorting
const getEventFilters = (query) => {
  const filters = {}
  const { 
    search, 
    category, 
    startDate, 
    endDate, 
    minPrice, 
    maxPrice,
    location,
    status
  } = query

  if (search) {
    filters[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } }
    ]
  }

  if (category) {
    filters.category = category
  }

  if (startDate && endDate) {
    filters.startDate = {
      [Op.between]: [new Date(startDate), new Date(endDate)]
    }
  }

  if (minPrice && maxPrice) {
    filters.price = {
      [Op.between]: [parseFloat(minPrice), parseFloat(maxPrice)]
    }
  }

  if (location) {
    filters.location = { [Op.iLike]: `%${location}%` }
  }

  if (status) {
    filters.status = status
  }

  return filters
}

const getAllEvents = catchAsync(async (req, res, next) => {
  // Build query using APIFeatures
  const features = new APIFeatures(Event, req.query).filter().sort().limitFields().paginate()

  const queryOptions = features.getQueryOptions()

  // Add condition to only show active events
  queryOptions.where.isActive = true

  // Get total count for pagination
  const totalEvents = await Event.count({ where: queryOptions.where })

  // Execute query
  const events = await Event.findAll(queryOptions)

  // Calculate pagination info
  const page = req.query.page * 1 || 1
  const limit = req.query.limit * 1 || 10
  const totalPages = Math.ceil(totalEvents / limit)

  res.status(200).json({
    status: "success",
    results: events.length,
    pagination: {
      page,
      limit,
      totalPages,
      totalEvents,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    data: {
      events,
    },
  })
})

const getEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findOne({
    where: {
      id: req.params.id,
      isActive: true,
    },
    include: [
      {
        model: Booking,
        as: "bookings",
        where: { status: "confirmed" },
        required: false,
        attributes: ["id", "numberOfSeats", "bookingDate"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["firstName", "lastName"],
          },
        ],
      },
    ],
  })

  if (!event) {
    return next(new AppError("No event found with that ID", 404))
  }

  res.status(200).json({
    status: "success",
    data: {
      event,
    },
  })
})

// Sophisticated event creation with validation
const createEvent = catchAsync(async (req, res, next) => {
  const transaction = await sequelize.transaction()

  try {
    const {
      title,
      description,
      startDate,
      endDate,
      location,
      price,
      capacity,
      category
    } = req.body

    // Enhanced validation
    if (new Date(startDate) <= new Date()) {
      return next(new AppError("Event start date must be in the future", 400))
    }

    if (new Date(endDate) <= new Date(startDate)) {
      return next(new AppError("Event end date must be after start date", 400))
    }

    const event = await Event.create({
      title,
      description,
      startDate,
      endDate,
      location,
      price,
      capacity,
      category,
      organizerId: req.user.id,
      status: "upcoming",
      availableSeats: capacity
    }, { transaction })

    await transaction.commit()

    res.status(201).json({
      status: "success",
      data: { event }
    })
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
})

// Enhanced event retrieval with dynamic filtering
const getEvents = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const offset = (page - 1) * limit

  const filters = getEventFilters(req.query)
  const order = req.query.sort ? [[req.query.sort, req.query.order || "ASC"]] : [["startDate", "ASC"]]

  const { count, rows: events } = await Event.findAndCountAll({
    where: filters,
    order,
    limit,
    offset,
    include: [{
      model: User,
      as: "organizer",
      attributes: ["id", "firstName", "lastName", "email"]
    }]
  })

  res.status(200).json({
    status: "success",
    results: count,
    data: { events },
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    }
  })
})

// Sophisticated event update with validation
const updateEvent = catchAsync(async (req, res, next) => {
  const transaction = await sequelize.transaction()

  try {
    const event = await Event.findByPk(req.params.id)

    if (!event) {
      return next(new AppError("Event not found", 404))
    }

    if (event.organizerId !== req.user.id && req.user.role !== "admin") {
      return next(new AppError("Not authorized to update this event", 403))
    }

    const updates = req.body

    // Prevent updating certain fields
    delete updates.organizerId
    delete updates.status
    delete updates.availableSeats

    // Enhanced validation for date updates
    if (updates.startDate && new Date(updates.startDate) <= new Date()) {
      return next(new AppError("Event start date must be in the future", 400))
    }

    if (updates.endDate && new Date(updates.endDate) <= new Date(updates.startDate || event.startDate)) {
      return next(new AppError("Event end date must be after start date", 400))
    }

    await event.update(updates, { transaction })
    await transaction.commit()

    res.status(200).json({
      status: "success",
      data: { event }
    })
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
})

// Enhanced event deletion with cleanup
const deleteEvent = catchAsync(async (req, res, next) => {
  const transaction = await sequelize.transaction()

  try {
    const event = await Event.findByPk(req.params.id)

    if (!event) {
      return next(new AppError("Event not found", 404))
    }

    if (event.organizerId !== req.user.id && req.user.role !== "admin") {
      return next(new AppError("Not authorized to delete this event", 403))
    }

    // Check for existing bookings
    const bookings = await Booking.count({
      where: { eventId: event.id },
      transaction
    })

    if (bookings > 0) {
      return next(new AppError("Cannot delete event with existing bookings", 400))
    }

    await event.destroy({ transaction })
    await transaction.commit()

    res.status(204).json({
      status: "success",
      data: null
    })
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
})

// Sophisticated event statistics
const getEventStats = catchAsync(async (req, res, next) => {
  const stats = await Event.findAll({
    attributes: [
      "category",
      [sequelize.fn("COUNT", sequelize.col("id")), "totalEvents"],
      [sequelize.fn("SUM", sequelize.col("capacity")), "totalCapacity"],
      [sequelize.fn("SUM", sequelize.col("availableSeats")), "totalAvailableSeats"],
      [sequelize.fn("AVG", sequelize.col("price")), "averagePrice"]
    ],
    group: ["category"],
    include: [{
      model: Booking,
      attributes: [[sequelize.fn("COUNT", sequelize.col("id")), "totalBookings"]]
    }]
  })

  res.status(200).json({
    status: "success",
    data: { stats }
  })
})

module.exports = {
  getAllEvents,
  getEvent,
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  getEventStats,
}
