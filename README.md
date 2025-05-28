# Event Booking System API

A comprehensive, production-ready RESTful API for an Event Booking System built with Node.js, Express.js, Sequelize ORM, and PostgreSQL.

## Features

### 🔐 Authentication & Authorization
- User registration and login with JWT authentication
- Role-based access control (user, admin)
- Password hashing with bcrypt
- Protected routes with middleware

### 🎫 Event Management
- Public endpoints to view events (no authentication required)
- Admin-only endpoints to create, update, and delete events
- Advanced filtering and pagination
- Search functionality
- Event statistics

### 📝 Booking System
- Authenticated users can book events
- Prevent overbooking with transaction-based seat management
- View and cancel personal bookings
- Admin dashboard for all bookings
- Booking statistics

### 🛡️ Security & Performance
- Rate limiting for API endpoints
- Input validation with Joi
- SQL injection protection with Sequelize ORM
- CORS and security headers with Helmet
- Centralized error handling

### 📚 Documentation
- Complete Swagger/OpenAPI documentation
- Interactive API explorer
- Comprehensive endpoint documentation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, bcrypt
- **Rate Limiting**: express-rate-limit

## Project Structure

```
server/
├── config/
│   ├── database.js              # Database configuration
│   └── swagger.js               # Swagger configuration
├── controllers/
│   ├── auth.controller.js       # Authentication logic
│   ├── event.controller.js      # Event management logic
│   └── booking.controller.js    # Booking management logic
├── middleware/
│   ├── auth.js                  # Authentication middleware
│   ├── validation.js            # Input validation schemas
│   ├── error-handler.js         # Global error handling
│   └── rate-limiter.js          # Rate limiting configuration
├── models/
│   ├── index.js                 # Sequelize initialization
│   ├── user.js                  # User model
│   ├── event.js                 # Event model
│   └── booking.js               # Booking model
├── routes/
│   ├── auth.routes.js           # Authentication routes
│   ├── event.routes.js          # Event routes
│   └── booking.routes.js        # Booking routes
├── migrations/                  # Database migrations
├── seeders/                     # Database seeders
├── utils/
│   ├── app-error.js            # Custom error class
│   ├── catch-async.js          # Async error wrapper
│   └── api-features.js         # Query building utilities
├── .env                        # Environment variables
├── .sequelizerc               # Sequelize configuration
├── app.js                     # Express application
└── package.json               # Dependencies and scripts
```

## Professional Naming Conventions

This project follows industry-standard naming conventions:

### File Naming
- **kebab-case** for file names: `auth.controller.js`, `error-handler.js`
- **lowercase** for model files: `user.js`, `event.js`, `booking.js`
- **Descriptive suffixes**: `.controller.js`, `.routes.js`, `.middleware.js`

### Code Naming
- **camelCase** for variables and functions: `getUserById`, `createBooking`
- **PascalCase** for classes and models: `User`, `Event`, `AppError`
- **UPPER_SNAKE_CASE** for constants: `JWT_SECRET`, `DB_HOST`

### Directory Structure
- **Plural nouns** for directories: `controllers/`, `models/`, `routes/`
- **Logical grouping** by functionality
- **Clear separation** of concerns

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Clone and Install Dependencies
\`\`\`bash
cd server
npm install
\`\`\`

### 2. Environment Setup
Create a `.env` file in the server directory:
\`\`\`env
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=event_booking_db
DB_USERNAME=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
JWT_EXPIRES_IN=7d

# API Configuration
API_VERSION=v1
\`\`\`

### 3. Database Setup
\`\`\`bash
# Create database
npm run db:create

# Run migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
\`\`\`

### 4. Start the Server
\`\`\`bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
\`\`\`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user profile
- `PATCH /api/v1/auth/update-password` - Update password

### Events
- `GET /api/v1/events` - Get all events (with filtering & pagination)
- `GET /api/v1/events/:id` - Get event by ID
- `POST /api/v1/events` - Create event (Admin only)
- `PATCH /api/v1/events/:id` - Update event (Admin only)
- `DELETE /api/v1/events/:id` - Delete event (Admin only)
- `GET /api/v1/events/stats` - Get event statistics (Admin only)

### Bookings
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings/my-bookings` - Get user's bookings
- `GET /api/v1/bookings/:id` - Get booking by ID
- `PATCH /api/v1/bookings/:id/cancel` - Cancel booking
- `GET /api/v1/bookings/all` - Get all bookings (Admin only)
- `GET /api/v1/bookings/stats` - Get booking statistics (Admin only)

## API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:3000/api-docs`
- **Health Check**: `http://localhost:3000/health`

## Database Scripts

\`\`\`bash
# Create database
npm run db:create

# Drop database
npm run db:drop

# Run migrations
npm run db:migrate

# Undo last migration
npm run db:migrate:undo

# Run all seeders
npm run db:seed

# Undo all seeders
npm run db:seed:undo
\`\`\`

## Sample Data

The seeder creates:
- **Admin User**: admin@example.com / password123
- **Regular Users**: john@example.com, jane@example.com / password123
- **Sample Events**: Tech Conference, Music Festival, Startup Pitch Competition

## Query Examples

### Get Events with Filtering
\`\`\`bash
GET /api/v1/events?location=San Francisco&dateFrom=2024-12-01&page=1&limit=10
\`\`\`

### Search Events
\`\`\`bash
GET /api/v1/events?search=tech&minPrice=100&maxPrice=500
\`\`\`

### Create Booking
\`\`\`bash
POST /api/v1/bookings
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "eventId": "event-uuid-here",
  "numberOfSeats": 2
}
\`\`\`

## Error Handling

The API uses consistent error responses:
\`\`\`json
{
  "status": "error",
  "message": "Error description"
}
\`\`\`

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **Booking**: 3 requests per minute

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection protection
- Rate limiting
- CORS configuration
- Security headers with Helmet

## Best Practices Implemented

### Code Organization
- **MVC Architecture**: Clear separation of models, views, and controllers
- **Middleware Pattern**: Reusable middleware for common functionality
- **Service Layer**: Business logic separated from route handlers
- **Utility Functions**: Common functionality abstracted into utilities

### Error Handling
- **Centralized Error Handling**: Single point for error processing
- **Custom Error Classes**: Structured error responses
- **Async Error Catching**: Proper handling of async operations
- **Validation Errors**: Clear validation error messages

### Security
- **Input Validation**: All inputs validated before processing
- **Authentication**: JWT-based stateless authentication
- **Authorization**: Role-based access control
- **Rate Limiting**: Protection against abuse
- **SQL Injection Prevention**: Parameterized queries with Sequelize

### Performance
- **Database Indexing**: Proper indexes on frequently queried fields
- **Pagination**: Efficient data retrieval for large datasets
- **Connection Pooling**: Optimized database connections
- **Caching Headers**: Appropriate HTTP caching strategies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Author

Kush Varshney 