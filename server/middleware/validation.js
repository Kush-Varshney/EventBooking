const Joi = require("joi")
const AppError = require("../utils/app-error")

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body)
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(", ")
      return next(new AppError(errorMessage, 400))
    }
    next()
  }
}

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query)
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(", ")
      return next(new AppError(errorMessage, 400))
    }
    next()
  }
}

// Validation schemas
const userRegistrationSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  role: Joi.string().valid("user", "admin").optional(),
})

const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

const eventSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).max(2000).required(),
  dateTime: Joi.date().iso().greater("now").required(),
  location: Joi.string().min(3).max(200).required(),
  totalSeats: Joi.number().integer().min(1).max(100000).required(),
  price: Joi.number().min(0).optional(),
})

const eventUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  description: Joi.string().min(10).max(2000).optional(),
  dateTime: Joi.date().iso().greater("now").optional(),
  location: Joi.string().min(3).max(200).optional(),
  totalSeats: Joi.number().integer().min(1).max(100000).optional(),
  price: Joi.number().min(0).optional(),
})

const bookingSchema = Joi.object({
  eventId: Joi.string().uuid().required(),
  numberOfSeats: Joi.number().integer().min(1).max(10).optional(),
})

const eventQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  location: Joi.string().optional(),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  search: Joi.string().optional(),
})

module.exports = {
  validate,
  validateQuery,
  userRegistrationSchema,
  userLoginSchema,
  eventSchema,
  eventUpdateSchema,
  bookingSchema,
  eventQuerySchema,
}
