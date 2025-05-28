const jwt = require("jsonwebtoken")
const { User } = require("../models")
const catchAsync = require("../utils/catch-async")
const AppError = require("../utils/app-error")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const { Op } = require("sequelize")

// Dynamic token configuration
const getTokenConfig = () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  algorithm: "HS512"
})

// Enhanced password hashing with dynamic salt rounds
const hashPassword = async (password) => {
  const saltRounds = process.env.SALT_ROUNDS || 12
  const salt = await bcrypt.genSalt(saltRounds)
  return bcrypt.hash(password, salt)
}

// Sophisticated token generation with additional claims
const generateToken = (user) => {
  const config = getTokenConfig()
  const claims = {
    sub: user.id,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    jti: crypto.randomBytes(16).toString("hex")
  }
  return jwt.sign(claims, config.secret, { 
    expiresIn: config.expiresIn,
    algorithm: config.algorithm
  })
}

// Dynamic user sanitization
const sanitizeUser = (user) => {
  const { password, ...sanitizedUser } = user.toJSON()
  return sanitizedUser
}

const register = catchAsync(async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role = "user" } = req.body

    // Check for existing user with case-insensitive email
    const existingUser = await User.findOne({
      where: {
        email: {
          [Op.iLike]: email
        }
      }
    })

    if (existingUser) {
      return next(new AppError("Email already registered", 400))
    }

    // Enhanced password validation
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return next(new AppError("Password must be at least 8 characters long and contain uppercase letters and numbers", 400))
    }

    const hashedPassword = await hashPassword(password)
    
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      isActive: true,
      lastLoginAt: new Date()
    })

    const token = generateToken(user)
    const sanitizedUser = sanitizeUser(user)

    res.status(201).json({
      status: "success",
      token,
      data: { user: sanitizedUser }
    })
  } catch (error) {
    next(error)
  }
})

const login = catchAsync(async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Find user with case-insensitive email
    const user = await User.findOne({
      where: {
        email: {
          [Op.iLike]: email
        }
      }
    })

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError("Invalid email or password", 401))
    }

    if (!user.isActive) {
      return next(new AppError("Account is deactivated", 403))
    }

    // Update last login
    await user.update({
      lastLoginAt: new Date(),
      loginAttempts: 0
    })

    const token = generateToken(user)
    const sanitizedUser = sanitizeUser(user)

    res.status(200).json({
      status: "success",
      token,
      data: { user: sanitizedUser }
    })
  } catch (error) {
    next(error)
  }
})

const getMe = catchAsync(async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] }
    })

    if (!user) {
      return next(new AppError("User not found", 404))
    }

    res.status(200).json({
      status: "success",
      data: { user }
    })
  } catch (error) {
    next(error)
  }
})

const updatePassword = catchAsync(async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findByPk(req.user.id)

    if (!user) {
      return next(new AppError("User not found", 404))
    }

    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return next(new AppError("Current password is incorrect", 401))
    }

    // Enhanced password validation
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return next(new AppError("New password must be at least 8 characters long and contain uppercase letters and numbers", 400))
    }

    const hashedPassword = await hashPassword(newPassword)
    
    await user.update({
      password: hashedPassword,
      passwordChangedAt: new Date()
    })

    res.status(200).json({
      status: "success",
      message: "Password updated successfully"
    })
  } catch (error) {
    next(error)
  }
})

module.exports = {
  register,
  login,
  getMe,
  updatePassword,
}
