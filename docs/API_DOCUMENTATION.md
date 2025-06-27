# 📚 NestJS Authentication API Documentation

Complete API documentation for the NestJS Authentication service with ApiDog import instructions and best practices.

## 🚀 Quick Import to ApiDog

### Method 1: Import OpenAPI Specification (Recommended)
1. Open ApiDog
2. Click **"Import"** → **"Import from URL/File"**
3. Select **"OpenAPI 3.0"** format
4. Upload the file: `docs/openapi.yaml`
5. Click **"Import"**

### Method 2: Import Collection JSON
1. Open ApiDog
2. Click **"Import"** → **"Import Collection"**
3. Select **"Postman Collection v2.1"** format
4. Upload the file: `docs/apidog-collection.json`
5. Click **"Import"**

## 🔧 Environment Setup

### Variables to Configure in ApiDog
```javascript
// Environment Variables
baseUrl: "http://localhost:3001/api"  // or your production URL
authToken: ""                         // Will be auto-set by login requests
adminToken: ""                        // Will be auto-set by admin login
```

### Server Configurations
- **Development**: `http://localhost:3001/api`
- **Staging**: `https://staging-api.yourapp.com/api`
- **Production**: `https://api.yourapp.com/api`

## 🔐 Authentication

### Bearer Token Setup
Most endpoints require authentication. The collection is pre-configured with:
- **Collection-level auth**: Uses `{{authToken}}` variable
- **Admin endpoints**: Use `{{adminToken}}` variable
- **Public endpoints**: No authentication required

### Quick Login Flow
1. **Run "Login Admin"** to get admin privileges
2. **Run "Login User"** to get user privileges
3. Tokens are automatically saved to variables

## 📋 API Endpoints Overview

### 🔐 Authentication Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/register` | POST | ❌ Public | Register new user |
| `/auth/login` | POST | ❌ Public | User login |
| `/auth/change-password` | POST | 🔒 User | Change password |
| `/auth/forgot-password` | POST | ❌ Public | Request password reset |
| `/auth/reset-password` | POST | ❌ Public | Reset password with token |
| `/auth/verify-email` | GET | ❌ Public | Verify email address |
| `/auth/resend-verification` | POST | ❌ Public | Resend verification email |
| `/auth/profile` | GET | 🔒 User | Get user profile |
| `/auth/refresh` | POST | 🔒 User | Refresh JWT token |
| `/auth/me` | GET | 🔒 User | Get current user info |

### 👤 User Management Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/users` | POST | 👑 Admin | Create new user |
| `/users` | GET | 👑 Admin | Get all users |
| `/users/profile` | GET | 🔒 User | Get own profile |
| `/users/profile` | PATCH | 🔒 User | Update own profile |
| `/users/:id` | GET | 👑 Admin | Get user by ID |
| `/users/:id` | PATCH | 👑 Admin | Update user |
| `/users/:id` | DELETE | 👑 Admin | Delete user |
| `/users/:id/deactivate` | PATCH | 👑 Admin | Deactivate user |
| `/users/:id/activate` | PATCH | 👑 Admin | Activate user |

### 🌱 Database Seeding Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/seeders/seed` | POST | 👑 Admin | Populate test data |
| `/seeders/clear` | POST | 👑 Admin | Clear all users |
| `/seeders/reset` | POST | 👑 Admin | Reset database |

## 🧪 Test Data & Credentials

### Seeded Admin Users
```json
{
  "email": "admin@example.com",
  "password": "Admin123!"
}
{
  "email": "admin@demo.com", 
  "password": "DemoAdmin123!"
}
```

### Seeded Regular Users
```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
{
  "email": "jane@example.com",
  "password": "Password123!"
}
{
  "email": "alice@demo.com",
  "password": "Alice123!"
}
```

### Test Users (Special Cases)
```json
{
  "email": "test1@example.com",
  "password": "Test123!",
  "status": "unverified email"
}
{
  "email": "inactive@example.com",
  "password": "Inactive123!",
  "status": "inactive account"
}
```

## 🎯 Best Practices for API Testing

### 1. **Test Workflow Order**
```
1. Login Admin → Save admin token
2. Seed Database → Populate test data
3. Login User → Save user token
4. Test user endpoints
5. Test admin endpoints
6. Clear Database → Clean up
```

### 2. **Token Management**
- Login requests automatically save tokens to variables
- Use `{{authToken}}` for general authentication
- Use `{{adminToken}}` for admin-only endpoints
- Refresh tokens when they expire (24h default)

### 3. **Error Handling Testing**
- Test with invalid credentials
- Test expired tokens
- Test insufficient permissions
- Test validation errors

### 4. **Security Testing**
- Verify JWT token requirements
- Test role-based access control
- Validate input sanitization
- Check password complexity rules

## 📱 Request Examples

### Login and Save Token
```javascript
// Pre-request Script (already included)
// Auto-saves token to {{authToken}} variable

// Test Script
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.collectionVariables.set('authToken', response.access_token);
    console.log('Token saved:', response.access_token.substring(0, 20) + '...');
}
```

### Register New User
```json
{
  "email": "newuser@example.com",
  "firstName": "John",
  "lastName": "Doe", 
  "password": "SecurePass123!"
}
```

### Change Password
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

### Update Profile
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "email": "newemail@example.com"
}
```

## 🚨 Error Responses

### Common Error Formats
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}

{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 8 characters"
  ],
  "error": "Bad Request"
}

{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

### HTTP Status Codes
- **200**: Success
- **201**: Created
- **204**: No Content (Delete)
- **400**: Bad Request (Validation)
- **401**: Unauthorized (Invalid token)
- **403**: Forbidden (Insufficient permissions)
- **404**: Not Found
- **409**: Conflict (Duplicate email)

## 🔄 Testing Scenarios

### 1. **Complete User Registration Flow**
```
1. POST /auth/register
2. Check email verification (if email configured)
3. GET /auth/verify-email?token=...
4. POST /auth/login
5. GET /auth/profile
```

### 2. **Password Reset Flow**
```
1. POST /auth/forgot-password
2. Check email (if email configured)
3. POST /auth/reset-password
4. POST /auth/login (with new password)
```

### 3. **Admin User Management**
```
1. POST /auth/login (admin)
2. GET /users (list all)
3. POST /users (create)
4. PATCH /users/:id (update)
5. PATCH /users/:id/deactivate
6. DELETE /users/:id
```

### 4. **Database Seeding for Testing**
```
1. POST /auth/login (admin)
2. POST /seeders/reset (clear and seed)
3. GET /users (verify seeded data)
4. Test with seeded credentials
```

## 📊 Response Schemas

### User Object
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user",
  "isActive": true,
  "isEmailVerified": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Login Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    // User object (see above)
  }
}
```

## 🎨 Collection Organization

The ApiDog collection is organized into logical folders:

### 🔐 Authentication
- All auth-related endpoints
- Login/logout functionality
- Password management
- Email verification

### 👤 User Management  
- Profile operations
- Admin user management
- Account activation/deactivation

### 🌱 Database Seeding
- Development utilities
- Test data population
- Database management

## 🏷️ Tags and Categorization

- **Authentication**: Core auth functionality
- **User Management**: CRUD operations
- **Database Seeding**: Development tools
- **Admin Only**: Requires admin privileges
- **Public**: No authentication required

## 🔧 Customization

### Adding New Endpoints
1. Follow the existing naming convention
2. Use appropriate HTTP methods
3. Include proper authentication
4. Add descriptive names and documentation
5. Group in relevant folders

### Environment Variables
Add new variables as needed:
```javascript
userId: "1"                    // For parameterized requests
resetToken: ""                 // For password reset testing
verificationToken: ""          // For email verification
```

## 📝 Notes

- All timestamps are in ISO 8601 format
- Passwords must be at least 8 characters
- Email addresses must be valid
- JWT tokens expire in 24 hours (configurable)
- Admin privileges required for user management
- Database seeding is for development only

## 🔍 Troubleshooting

### Common Issues
1. **401 Unauthorized**: Check if token is set and valid
2. **403 Forbidden**: Verify user has required role
3. **404 Not Found**: Check endpoint URL and method
4. **400 Bad Request**: Validate request body format

### Debug Tips
- Use the console to check saved variables
- Verify token format and expiration
- Check server logs for detailed errors
- Ensure database is running and accessible

---

**Happy Testing! 🚀**

For more information, see the complete API specification in `openapi.yaml`.
