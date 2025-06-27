# 🌐 cURL Examples for NestJS Authentication API

Complete collection of cURL commands for testing all API endpoints.

## 📋 Quick Reference

- **Base URL**: `http://localhost:3001/api`
- **Authentication**: Bearer token in Authorization header
- **Content-Type**: `application/json` for POST/PATCH requests

## 🔐 Authentication Endpoints

### 1. Register New User

```bash
# Register a new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "password": "SecurePass123!"
  }'

# Expected Response (201):
# {
#   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": {
#     "id": 16,
#     "email": "newuser@example.com",
#     "firstName": "John",
#     "lastName": "Doe",
#     "role": "user",
#     "isActive": true,
#     "isEmailVerified": false,
#     "createdAt": "2024-01-01T00:00:00.000Z",
#     "updatedAt": "2024-01-01T00:00:00.000Z"
#   }
# }
```

### 2. Login User

```bash
# Login with admin credentials
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'

# Login with regular user credentials
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123!"
  }'

# Save the token from response for subsequent requests
# Expected Response (200):
# {
#   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": { ... }
# }
```

### 3. Change Password

```bash
# Change password (requires authentication)
curl -X POST http://localhost:3001/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "currentPassword": "Password123!",
    "newPassword": "NewPassword123!"
  }'

# Expected Response (200):
# {
#   "message": "Password changed successfully"
# }
```

### 4. Forgot Password

```bash
# Request password reset
curl -X POST http://localhost:3001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'

# Expected Response (200):
# {
#   "message": "If the email exists, a password reset link has been sent"
# }
```

### 5. Reset Password

```bash
# Reset password with token from email
curl -X POST http://localhost:3001/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "550e8400-e29b-41d4-a716-446655440000",
    "newPassword": "NewPassword123!"
  }'

# Expected Response (200):
# {
#   "message": "Password reset successfully"
# }
```

### 6. Verify Email

```bash
# Verify email with token from registration email
curl -X GET "http://localhost:3001/api/auth/verify-email?token=550e8400-e29b-41d4-a716-446655440000"

# Expected Response (200):
# {
#   "message": "Email verified successfully"
# }
```

### 7. Resend Email Verification

```bash
# Resend verification email
curl -X POST http://localhost:3001/api/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'

# Expected Response (200):
# {
#   "message": "Verification email sent"
# }
```

### 8. Get Profile

```bash
# Get current user profile
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected Response (200):
# {
#   "id": 1,
#   "email": "user@example.com",
#   "firstName": "John",
#   "lastName": "Doe",
#   "role": "user",
#   "isActive": true,
#   "isEmailVerified": true,
#   "createdAt": "2024-01-01T00:00:00.000Z",
#   "updatedAt": "2024-01-01T00:00:00.000Z"
# }
```

### 9. Refresh Token

```bash
# Refresh JWT token
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected Response (200):
# {
#   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": { ... }
# }
```

### 10. Get Current User

```bash
# Get current user info (alias for /auth/profile)
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected Response (200): Same as /auth/profile
```

## 👤 User Management Endpoints

### 1. Create User (Admin Only)

```bash
# Create admin user
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "email": "newadmin@example.com",
    "firstName": "New",
    "lastName": "Admin",
    "password": "AdminPass123!",
    "role": "admin"
  }'

# Create regular user
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "email": "regularuser@example.com",
    "firstName": "Regular",
    "lastName": "User",
    "password": "UserPass123!",
    "role": "user"
  }'

# Expected Response (201): User object
```

### 2. Get All Users (Admin Only)

```bash
# Get list of all users
curl -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Expected Response (200): Array of user objects
# [
#   {
#     "id": 1,
#     "email": "admin@example.com",
#     "firstName": "Super",
#     "lastName": "Admin",
#     "role": "admin",
#     "isActive": true,
#     "isEmailVerified": true,
#     "createdAt": "2024-01-01T00:00:00.000Z",
#     "updatedAt": "2024-01-01T00:00:00.000Z"
#   },
#   ...
# ]
```

### 3. Get Own Profile

```bash
# Get own profile (user management context)
curl -X GET http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected Response (200): User object
```

### 4. Update Own Profile

```bash
# Update own profile
curl -X PATCH http://localhost:3001/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "firstName": "Updated",
    "lastName": "Name",
    "email": "updatedemail@example.com"
  }'

# Expected Response (200): Updated user object
```

### 5. Get User by ID (Admin Only)

```bash
# Get specific user by ID
curl -X GET http://localhost:3001/api/users/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get user by different ID
curl -X GET http://localhost:3001/api/users/5 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Expected Response (200): User object
# Expected Response (404): User not found
```

### 6. Update User (Admin Only)

```bash
# Promote user to admin
curl -X PATCH http://localhost:3001/api/users/5 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "role": "admin"
  }'

# Update user details
curl -X PATCH http://localhost:3001/api/users/3 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "firstName": "Updated",
    "lastName": "User",
    "email": "newemail@example.com"
  }'

# Expected Response (200): Updated user object
```

### 7. Delete User (Admin Only)

```bash
# Delete user permanently
curl -X DELETE http://localhost:3001/api/users/10 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Expected Response (204): No content (success)
# Expected Response (404): User not found
```

### 8. Deactivate User (Admin Only)

```bash
# Deactivate user account
curl -X PATCH http://localhost:3001/api/users/8/deactivate \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Expected Response (200): User object with isActive: false
```

### 9. Activate User (Admin Only)

```bash
# Activate user account
curl -X PATCH http://localhost:3001/api/users/8/activate \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Expected Response (200): User object with isActive: true
```

## 🌱 Database Seeding Endpoints

### 1. Seed Database (Admin Only)

```bash
# Populate database with sample users
curl -X POST http://localhost:3001/api/seeders/seed \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Expected Response (200):
# {
#   "message": "Database seeded successfully"
# }
```

### 2. Clear Database (Admin Only)

```bash
# Clear all users from database
curl -X POST http://localhost:3001/api/seeders/clear \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Expected Response (200):
# {
#   "message": "Database cleared successfully"
# }
```

### 3. Reset Database (Admin Only)

```bash
# Clear and re-seed database
curl -X POST http://localhost:3001/api/seeders/reset \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Expected Response (200):
# {
#   "message": "Database reset successfully"
# }
```

## 🧪 Complete Testing Workflow

### Step 1: Initial Setup

```bash
# 1. Start the API server
# npm run start:dev

# 2. Reset database with fresh data
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "Admin123!"}' \
  | jq -r '.access_token' > admin_token.txt

ADMIN_TOKEN=$(cat admin_token.txt)

curl -X POST http://localhost:3001/api/seeders/reset \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Step 2: Authentication Testing

```bash
# Login and save tokens
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "Admin123!"}' \
  | jq -r '.access_token')

USER_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "Password123!"}' \
  | jq -r '.access_token')

echo "Admin Token: $ADMIN_TOKEN"
echo "User Token: $USER_TOKEN"
```

### Step 3: Test User Operations

```bash
# Get user profile
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer $USER_TOKEN"

# Update profile
curl -X PATCH http://localhost:3001/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "firstName": "Updated",
    "lastName": "User"
  }'
```

### Step 4: Test Admin Operations

```bash
# Get all users
curl -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Create new user
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "email": "testuser@example.com",
    "firstName": "Test",
    "lastName": "User",
    "password": "TestPass123!",
    "role": "user"
  }'

# Deactivate user
curl -X PATCH http://localhost:3001/api/users/15/deactivate \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## 🚨 Error Handling Examples

### 401 Unauthorized

```bash
# Missing token
curl -X GET http://localhost:3001/api/auth/profile

# Invalid token
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer invalid_token"

# Expected Response (401):
# {
#   "statusCode": 401,
#   "message": "Unauthorized",
#   "error": "Unauthorized"
# }
```

### 403 Forbidden

```bash
# User trying to access admin endpoint
curl -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer $USER_TOKEN"

# Expected Response (403):
# {
#   "statusCode": 403,
#   "message": "Forbidden resource",
#   "error": "Forbidden"
# }
```

### 400 Bad Request

```bash
# Invalid email format
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "firstName": "John",
    "lastName": "Doe",
    "password": "short"
  }'

# Expected Response (400):
# {
#   "statusCode": 400,
#   "message": [
#     "email must be an email",
#     "password must be longer than or equal to 8 characters"
#   ],
#   "error": "Bad Request"
# }
```

### 409 Conflict

```bash
# Duplicate email registration
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "password": "Password123!"
  }'

# Expected Response (409):
# {
#   "statusCode": 409,
#   "message": "User with this email already exists",
#   "error": "Conflict"
# }
```

## 📱 Environment Variables

```bash
# Set base URL for different environments
export API_BASE_URL="http://localhost:3001/api"
# export API_BASE_URL="https://api.yourapp.com/api"  # Production

# Use in requests
curl -X GET $API_BASE_URL/auth/profile \
  -H "Authorization: Bearer $USER_TOKEN"
```

## 🔧 Utility Scripts

### Extract Token from Login Response

```bash
# Login and extract token
get_admin_token() {
  curl -s -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@example.com", "password": "Admin123!"}' \
    | jq -r '.access_token'
}

get_user_token() {
  curl -s -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "john@example.com", "password": "Password123!"}' \
    | jq -r '.access_token'
}

# Usage
ADMIN_TOKEN=$(get_admin_token)
USER_TOKEN=$(get_user_token)
```

### Test All Endpoints

```bash
#!/bin/bash
# test_api.sh - Complete API test script

BASE_URL="http://localhost:3001/api"

# Get tokens
ADMIN_TOKEN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "Admin123!"}' \
  | jq -r '.access_token')

USER_TOKEN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "Password123!"}' \
  | jq -r '.access_token')

echo "Testing Authentication Endpoints..."

# Test profile endpoint
echo "Testing GET /auth/profile"
curl -s -X GET $BASE_URL/auth/profile \
  -H "Authorization: Bearer $USER_TOKEN" \
  | jq '.email'

# Test admin endpoints
echo "Testing GET /users (Admin)"
curl -s -X GET $BASE_URL/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  | jq 'length'

echo "All tests completed!"
```

## 💡 Tips and Best Practices

### 1. Using jq for JSON Processing

```bash
# Extract specific fields
curl -s -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer $USER_TOKEN" \
  | jq '.email, .role, .isActive'

# Count users
curl -s -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  | jq 'length'

# Filter by role
curl -s -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  | jq '.[] | select(.role == "admin")'
```

### 2. Save and Reuse Tokens

```bash
# Save tokens to files
echo $ADMIN_TOKEN > ~/.api_admin_token
echo $USER_TOKEN > ~/.api_user_token

# Load tokens
ADMIN_TOKEN=$(cat ~/.api_admin_token)
USER_TOKEN=$(cat ~/.api_user_token)
```

### 3. Error Handling in Scripts

```bash
# Check if request was successful
response=$(curl -s -w "%{http_code}" -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer $USER_TOKEN")

http_code=${response: -3}
body=${response%???}

if [ $http_code = "200" ]; then
  echo "Success: $body"
else
  echo "Error ($http_code): $body"
fi
```

---

**Happy Testing! 🚀**

These cURL examples cover all endpoints and common scenarios for the NestJS Authentication API.
