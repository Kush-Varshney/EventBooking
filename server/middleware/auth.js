const jwt = require("jsonwebtoken")
const { User } = require("../models")
const AppError = require("../utils/app-error")
const catchAsync = require("../utils/catch-async")

const authenticate = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  }

  if (!token) {
    return next(new AppError("You are not logged in! Please log in to get access.", 401))
  }

  // 2) Verification token
  const decoded = jwt.verify(token, process.env.JWT_SECRET)

  // 3) Check if user still exists
  const currentUser = await User.findByPk(decoded.id)
  if (!currentUser) {
    return next(new AppError("The user belonging to this token does no longer exist.", 401))
  }

  // 4) Check if user is active
  if (!currentUser.isActive) {
    return next(new AppError("Your account has been deactivated. Please contact support.", 401))
  }

  // Grant access to protected route
  req.user = currentUser
  next()
})

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action", 403))
    }
    next()
  }
}

const optionalAuth = catchAsync(async (req, res, next) => {
  let token
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const currentUser = await User.findByPk(decoded.id)

      if (currentUser && currentUser.isActive) {
        req.user = currentUser
      }
    } catch (error) {
      // Token is invalid, but we continue without authentication
    }
  }

  next()
})

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
}
