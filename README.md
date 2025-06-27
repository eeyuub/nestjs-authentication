# NestJS Authentication API

A comprehensive authentication service built with NestJS, featuring JWT authentication, role-based access control, password management, and email verification.

## Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 👥 **Role-Based Access Control** - User and Admin roles
- 🔑 **Password Management** - Change password for authenticated users
- 📧 **Password Reset** - Forgot password functionality with email
- ✅ **Email Verification** - Email verification system
- 🛡️ **Custom Decorators** - `@AuthenticatedUser()` decorator to easily get current user
- 🔒 **Guards & Middleware** - Comprehensive security implementation
- 🐘 **PostgreSQL Database** - Production-ready database with advanced features
- 🏗️ **Well-structured Architecture** - Modular design with separate User and Auth modules

## Project Structure

```
src/
├── auth/                          # Authentication module
│   ├── decorators/               # Custom decorators
│   │   ├── authenticated-user.decorator.ts
│   │   ├── public.decorator.ts
│   │   └── roles.decorator.ts
│   ├── dto/                      # Data Transfer Objects
│   │   ├── change-password.dto.ts
│   │   ├── forgot-password.dto.ts
│   │   ├── login.dto.ts
│   │   ├── register.dto.ts
│   │   └── reset-password.dto.ts
│   ├── guards/                   # Authentication & Authorization guards
│   │   ├── jwt-auth.guard.ts
│   │   ├── local-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── services/                 # Additional services
│   │   └── email.service.ts
│   ├── strategies/               # Passport strategies
│   │   ├── jwt.strategy.ts
│   │   └── local.strategy.ts
│   ├── auth.controller.ts        # Authentication endpoints
│   ├── auth.module.ts           # Auth module configuration
│   └── auth.service.ts          # Authentication business logic
├── user/                         # User management module
│   ├── dto/                     # User DTOs
│   │   ├── create-user.dto.ts
│   │   ├── update-user.dto.ts
│   │   └── user-response.dto.ts
│   ├── entities/                # Database entities
│   │   └── user.entity.ts
│   ├── user.controller.ts       # User management endpoints
│   ├── user.module.ts          # User module configuration
│   └── user.service.ts         # User business logic
├── app.module.ts               # Main application module
└── main.ts                    # Application bootstrap
```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Public |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register a new user | ✅ |
| POST | `/api/auth/login` | Login user | ✅ |
| POST | `/api/auth/change-password` | Change password | 🔒 |
| POST | `/api/auth/forgot-password` | Request password reset | ✅ |
| POST | `/api/auth/reset-password` | Reset password with token | ✅ |
| GET | `/api/auth/verify-email` | Verify email with token | ✅ |
| POST | `/api/auth/resend-verification` | Resend verification email | ✅ |
| GET | `/api/auth/profile` | Get current user profile | 🔒 |
| POST | `/api/auth/refresh` | Refresh JWT token | 🔒 |
| GET | `/api/auth/me` | Get current user info | 🔒 |

### User Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/users` | Create new user | 👑 Admin |
| GET | `/api/users` | Get all users | 👑 Admin |
| GET | `/api/users/profile` | Get own profile | 🔒 Authenticated |
| GET | `/api/users/:id` | Get user by ID | 👑 Admin |
| PATCH | `/api/users/profile` | Update own profile | 🔒 Authenticated |
| PATCH | `/api/users/:id` | Update user | 👑 Admin |
| DELETE | `/api/users/:id` | Delete user | 👑 Admin |
| PATCH | `/api/users/:id/deactivate` | Deactivate user | 👑 Admin |
| PATCH | `/api/users/:id/activate` | Activate user | 👑 Admin |

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Docker and Docker Compose (for database setup)
- PostgreSQL (if not using Docker)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Set up PostgreSQL Database:**
   
   **Option A: Using Docker (Recommended)**
   ```bash
   # Start PostgreSQL with Docker
   npm run db:up
   
   # (Optional) Start pgAdmin for database management
   npm run pgadmin:up
   ```
   
   **Option B: Using existing PostgreSQL installation**
   - Create a database named `nestjs_auth`
   - Update the database credentials in `.env`

4. **Update the `.env` file with your configuration:**
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=password
   DB_NAME=nestjs_auth
   DB_SSL=false
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Email Configuration (for password reset)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=your-email@gmail.com
   ```

4. **Run the application:**
   ```bash
   # Development
   npm run start:dev
   
   # Production
   npm run build
   npm run start:prod
   ```

The API will be available at `http://localhost:3001/api`

## Usage Examples

### Register a new user
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "password": "securepassword123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

### Access protected endpoint
```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using the @AuthenticatedUser() decorator
```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
async getProfile(@AuthenticatedUser() user: User) {
  // user object is automatically injected from JWT
  return user;
}
```

## Key Features Explained

### 1. AuthenticatedUser Decorator
The custom `@AuthenticatedUser()` decorator automatically extracts the user from the JWT token and injects it into your endpoint handlers:

```typescript
@Post('change-password')
@UseGuards(JwtAuthGuard)
async changePassword(
  @AuthenticatedUser() user: User,
  @Body() changePasswordDto: ChangePasswordDto,
) {
  // user is automatically available without manual extraction
}
```

### 2. Role-Based Access Control
Use the `@Roles()` decorator with `RolesGuard` for authorization:

```typescript
@Get()
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
async findAll() {
  // Only admin users can access this endpoint
}
```

### 3. Password Reset Flow
1. User requests password reset with email
2. System generates secure token and sends email
3. User clicks link in email with token
4. User submits new password with token
5. System validates token and updates password

### 4. Email Verification
- Users receive verification email on registration
- Email contains verification link
- Users can resend verification if needed

## Security Features

- **Password Hashing**: BCrypt with salt rounds
- **JWT Security**: Configurable expiration and secret
- **Token Validation**: Comprehensive JWT validation
- **Rate Limiting**: Built-in validation pipes
- **Input Validation**: Class-validator decorators
- **CORS Configuration**: Configurable CORS settings

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_USERNAME` | PostgreSQL username | postgres |
| `DB_PASSWORD` | PostgreSQL password | password |
| `DB_NAME` | PostgreSQL database name | nestjs_auth |
| `DB_SSL` | Enable SSL for database | false |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | 24h |
| `SMTP_HOST` | SMTP server host | Required for emails |
| `SMTP_PORT` | SMTP server port | 587 |
| `SMTP_USER` | SMTP username | Required for emails |
| `SMTP_PASS` | SMTP password | Required for emails |
| `FRONTEND_URL` | Frontend URL for email links | http://localhost:3000 |

## Development

### Available Scripts

```bash
# Development
npm run start:dev     # Start with file watching
npm run start:debug   # Start with debugging

# Building
npm run build         # Build the application

# Testing
npm run test          # Run unit tests
npm run test:e2e      # Run end-to-end tests
npm run test:cov      # Run tests with coverage

# Linting
npm run lint          # Run ESLint
npm run format        # Format code with Prettier

# Database Management
npm run db:up         # Start PostgreSQL with Docker
npm run db:down       # Stop and remove containers
npm run db:logs       # View PostgreSQL logs
npm run db:reset      # Reset database (removes all data)
npm run pgadmin:up    # Start pgAdmin for database management
npm run dev:full      # Start database and application

# Database Seeding
npm run seed          # Seed database with sample users
npm run seed:clear    # Clear all users from database
npm run seed:reset    # Reset database (clear + seed)
```

## Database Seeding

The project includes a comprehensive seeder system that creates sample users for testing and development.

### Seeded Users

- **2 Admin Users**: For testing admin functionality
- **10 Regular Users**: For general testing
- **3 Test Users**: Including inactive and unverified users

See [SEEDED_USERS.md](./SEEDED_USERS.md) for complete list of credentials.

### Quick Start with Seeding

```bash
# Start database and seed with sample data
npm run db:up
npm run seed
npm run start:dev
```

### Admin Credentials (for quick testing)
- **Email**: `admin@example.com`
- **Password**: `Admin123!`

## 📖 API Documentation

Comprehensive API documentation and testing tools are available:

- **[API Documentation](./docs/API_DOCUMENTATION.md)** - Complete endpoint reference
- **[OpenAPI Specification](./docs/openapi.yaml)** - Machine-readable API spec
- **[ApiDog Collection](./docs/apidog-collection.json)** - Ready-to-import collection
- **[ApiDog Setup Guide](./docs/APIDOG_SETUP.md)** - Quick setup instructions

### Quick API Testing Setup

1. **Import to ApiDog**:
   - Open ApiDog → Import → Select `docs/openapi.yaml`
   - Or import `docs/apidog-collection.json` as Postman collection

2. **Configure Environment**:
   ```
   baseUrl: http://localhost:3001/api
   authToken: (auto-set by login)
   adminToken: (auto-set by admin login)
   ```

3. **Test Flow**:
   - Run "Login Admin" → Saves admin token
   - Run "Get All Users" → Verify API works
   - Explore other endpoints with authentication

## License

This project is licensed under the UNLICENSED License.
