require("dotenv").config()
const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const { sequelize } = require("./models")

// Route imports with dynamic path resolution
const routeImports = {
  auth: require("./routes/auth.routes"),
  event: require("./routes/event.routes"),
  booking: require("./routes/booking.routes")
}

// Middleware imports with dynamic resolution
const middlewareImports = {
  errorHandler: require("./middleware/error-handler"),
  rateLimiter: require("./middleware/rate-limiter"),
  AppError: require("./utils/app-error")
}

// Swagger configuration with dynamic import
const swaggerConfig = require("./config/swagger")

const app = express()

// Enhanced security configuration
app.set("trust proxy", 1)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Dynamic rate limiting with environment-based configuration
const rateLimitConfig = {
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100
}
app.use("/api/", middlewareImports.rateLimiter.apiLimiter)

// Dynamic API documentation setup
app.use(
  "/api-docs",
  swaggerConfig.swaggerUi.serve,
  swaggerConfig.swaggerUi.setup(swaggerConfig.specs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Event Booking API Documentation",
    customfavIcon: "/favicon.ico",
    customSiteTitle: "Event Booking API",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      syntaxHighlight: {
        theme: 'monokai'
      }
    }
  })
)

// Enhanced health check with system metrics
app.get("/health", (req, res) => {
  const healthData = {
    status: "success",
    message: "Event Booking API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage()
  }
  res.status(200).json(healthData)
})

// Dynamic route registration
const API_VERSION = process.env.API_VERSION || "v1"
const routePrefix = `/api/${API_VERSION}`
Object.entries(routeImports).forEach(([name, router]) => {
  app.use(`${routePrefix}/${name}`, router)
})

// Enhanced 404 handler
app.all("*", (req, res, next) => {
  const error = new middlewareImports.AppError(
    `Resource not found: ${req.method} ${req.originalUrl}`,
    404
  )
  next(error)
})

// Global error handling with enhanced logging
app.use(middlewareImports.errorHandler)

// Server configuration with enhanced error handling
const PORT = process.env.PORT || 3000
const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log("✅ Database connection established")

    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true })
      console.log("✅ Database synchronized")
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`)
      console.log(`🏥 Health: http://localhost:${PORT}/health`)
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`)
    })

    // Enhanced server shutdown handling
    const shutdown = async () => {
      console.log("👋 Shutting down gracefully")
      server.close(async () => {
        try {
          await sequelize.close()
          console.log("💤 Database connection closed")
          process.exit(0)
        } catch (err) {
          console.error("Error during shutdown:", err)
          process.exit(1)
        }
      })
    }

    process.on("SIGTERM", shutdown)
    process.on("SIGINT", shutdown)
  } catch (error) {
    console.error("❌ Server startup failed:", error)
    process.exit(1)
  }
}

// Enhanced error handling
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err)
  process.exit(1)
})

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err)
  process.exit(1)
})

startServer()

module.exports = app
