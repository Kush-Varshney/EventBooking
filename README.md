# Event Booking System

A sophisticated event management and booking platform built with Node.js, Express, and Sequelize. This system implements advanced security measures, dynamic rate limiting, and complex business logic to provide a robust event booking experience.

## Core Features

### Authentication & Authorization
- Dynamic JWT-based authentication with enhanced security
- Role-based access control (RBAC)
- Sophisticated password hashing with configurable salt rounds
- Rate-limited authentication endpoints
- Session management with dynamic token generation

### Event Management
- Dynamic event creation and management
- Advanced filtering and search capabilities
- Real-time seat availability tracking
- Category-based event organization
- Sophisticated validation and business rules

### Booking System
- Transaction-based booking process
- Dynamic seat allocation
- Advanced booking validation
- Sophisticated cancellation policies
- Real-time availability updates

### Security Features
- Redis-based rate limiting
- Dynamic CORS configuration
- Enhanced security headers
- Sophisticated error handling
- Input validation and sanitization

## Technical Architecture

### Backend Stack
- Node.js with Express
- Sequelize ORM with PostgreSQL
- Redis for rate limiting
- JWT for authentication
- Swagger for API documentation

### Security Measures
- Dynamic rate limiting
- Enhanced password policies
- Sophisticated token management
- Input validation
- SQL injection prevention
- XSS protection

## Environment Setup

### Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)
- Redis (v6+)

### Configuration
Create a `.env` file with the following variables:
```env
# Server Configuration
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=event_booking
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
SALT_ROUNDS=12

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Rate Limiting
API_RATE_LIMIT_WINDOW_MS=900000
API_RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=5
BOOKING_RATE_LIMIT_WINDOW_MS=60000
BOOKING_RATE_LIMIT_MAX=3
```

### Installation
```bash
# Clone repository
git clone <repository-url>

# Install dependencies
npm install

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

## API Documentation

The API documentation is available at `/api-docs` when the server is running. It provides detailed information about:
- Available endpoints
- Request/response schemas
- Authentication requirements
- Rate limiting policies
- Error handling

## Development Guidelines

### Code Structure
```
server/
├── config/         # Configuration files
├── controllers/    # Business logic
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── utils/          # Utility functions
└── app.js          # Application entry point
```

### Best Practices
- Follow RESTful API design principles
- Implement proper error handling
- Use transactions for data consistency
- Follow security best practices
- Write comprehensive tests

## Security Considerations

### Rate Limiting
- API endpoints: 100 requests per 15 minutes
- Authentication: 5 attempts per 15 minutes
- Booking: 3 attempts per minute

### Password Requirements
- Minimum 8 characters
- Must contain uppercase letters
- Must contain numbers
- Must contain special characters

### Token Security
- Short expiration time
- Secure token generation
- Role-based claims
- Dynamic algorithm selection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

Kush Varshney
