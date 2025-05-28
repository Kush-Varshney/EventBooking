const AppError = require("../utils/app-error")

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`
  return new AppError(message, 400)
}

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
  const message = `Duplicate field value: ${value}. Please use another value!`
  return new AppError(message, 400)
}

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message)
  const message = `Invalid input data. ${errors.join(". ")}`
  return new AppError(message, 400)
}

const handleJWTError = () => new AppError("Invalid token. Please log in again!", 401)

const handleJWTExpiredError = () => new AppError("Your token has expired! Please log in again.", 401)

const handleSequelizeValidationError = (err) => {
  const errors = err.errors.map((error) => error.message)
  const message = `Validation error. ${errors.join(". ")}`
  return new AppError(message, 400)
}

const handleSequelizeUniqueConstraintError = (err) => {
  const field = err.errors[0].path
  const message = `${field} already exists. Please use a different value.`
  return new AppError(message, 400)
}

const handleSequelizeForeignKeyConstraintError = (err) => {
  const message = "Invalid reference to related resource."
  return new AppError(message, 400)
}

const sendErrorDev = (err, req, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  })
}

const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    })
  }

  // Programming or other unknown error: don't leak error details
  console.error("ERROR 💥", err)
  return res.status(500).json({
    status: "error",
    message: "Something went wrong!",
  })
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || "error"

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res)
  } else {
    let error = { ...err }
    error.message = err.message

    if (error.name === "CastError") error = handleCastErrorDB(error)
    if (error.code === 11000) error = handleDuplicateFieldsDB(error)
    if (error.name === "ValidationError") error = handleValidationErrorDB(error)
    if (error.name === "JsonWebTokenError") error = handleJWTError()
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError()
    if (error.name === "SequelizeValidationError") error = handleSequelizeValidationError(error)
    if (error.name === "SequelizeUniqueConstraintError") error = handleSequelizeUniqueConstraintError(error)
    if (error.name === "SequelizeForeignKeyConstraintError") error = handleSequelizeForeignKeyConstraintError(error)

    sendErrorProd(error, req, res)
  }
}
