const swaggerJsdoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Event Booking System API",
      version: "1.0.0",
      description: "A comprehensive Event Booking System API built with Node.js, Express, Sequelize, and PostgreSQL",
      contact: {
        name: "API Support",
        email: "support@eventbooking.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api/v1`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"], // paths to files containing OpenAPI definitions
}

const specs = swaggerJsdoc(options)

module.exports = {
  specs,
  swaggerUi,
}
