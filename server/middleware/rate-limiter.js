const rateLimit = require("express-rate-limit")
const RedisStore = require("rate-limit-redis")
const Redis = require("ioredis")

// Dynamic configuration based on environment
const getRateLimitConfig = (type) => {
  const baseConfig = {
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    keyGenerator: (req) => {
      return req.ip + (req.user ? `-${req.user.id}` : '')
    },
    handler: (req, res) => {
      res.status(429).json({
        status: "error",
        message: "Too many requests, please try again later.",
        retryAfter: res.getHeader('Retry-After'),
        timestamp: new Date().toISOString()
      })
    }
  }

  const configs = {
    api: {
      windowMs: process.env.API_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
      max: process.env.API_RATE_LIMIT_MAX || 100,
      message: {
        status: "error",
        message: "API rate limit exceeded. Please try again later.",
        code: "RATE_LIMIT_EXCEEDED"
      }
    },
    auth: {
      windowMs: process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
      max: process.env.AUTH_RATE_LIMIT_MAX || 5,
      message: {
        status: "error",
        message: "Too many authentication attempts. Please try again later.",
        code: "AUTH_RATE_LIMIT_EXCEEDED"
      }
    },
    booking: {
      windowMs: process.env.BOOKING_RATE_LIMIT_WINDOW_MS || 60 * 1000,
      max: process.env.BOOKING_RATE_LIMIT_MAX || 3,
      message: {
        status: "error",
        message: "Too many booking attempts. Please try again later.",
        code: "BOOKING_RATE_LIMIT_EXCEEDED"
      }
    }
  }

  return { ...baseConfig, ...configs[type] }
}

// Redis client configuration
const redisClient = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null

// Dynamic store selection
const getStore = () => {
  if (redisClient) {
    return new RedisStore({
      client: redisClient,
      prefix: 'rate-limit:',
      sendCommand: (...args) => redisClient.call(...args)
    })
  }
  return undefined
}

// Create rate limiters with dynamic configuration
const createRateLimiter = (type) => {
  const config = getRateLimitConfig(type)
  return rateLimit({
    ...config,
    store: getStore(),
    skip: (req) => {
      // Skip rate limiting for certain conditions
      return req.path.includes('/health') || 
             req.path.includes('/metrics') ||
             (req.user && req.user.role === 'admin')
    }
  })
}

// Export rate limiters
module.exports = {
  apiLimiter: createRateLimiter('api'),
  authLimiter: createRateLimiter('auth'),
  bookingLimiter: createRateLimiter('booking')
}
