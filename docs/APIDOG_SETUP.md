# 🐕 ApiDog Quick Setup Guide

Step-by-step guide to import and test the NestJS Authentication API in ApiDog.

## 📥 Import Options

### Option 1: OpenAPI Specification Import (Recommended)
```
File: docs/openapi.yaml
Format: OpenAPI 3.0
```

### Option 2: Collection Import
```
File: docs/apidog-collection.json  
Format: Postman Collection v2.1
```

## 🚀 Quick Start (5 Minutes)

### Step 1: Import Collection
1. Open ApiDog
2. Click **"Import"**
3. Choose **"Import from File"**
4. Select `docs/openapi.yaml`
5. Click **"Import"**

### Step 2: Set Environment
1. Go to **"Environments"**
2. Create new environment: **"Development"**
3. Add variables:
   ```
   baseUrl: http://localhost:3001/api
   authToken: (leave empty)
   adminToken: (leave empty)
   ```

### Step 3: Start Your API
```bash
cd nestjs-auth-api
pnpm run db:up          # Start PostgreSQL
pnpm run seed           # Populate test data
pnpm run start:dev      # Start API server
```

### Step 4: Test Basic Flow
1. **Run**: `Login Admin` → Gets admin token
2. **Run**: `Get All Users` → Verify seeded data
3. **Run**: `Login User` → Gets user token  
4. **Run**: `Get Profile` → Test user endpoint

## ✅ Verification Checklist

- [ ] Collection imported successfully
- [ ] Environment variables configured
- [ ] Database seeded with test data
- [ ] API server running on port 3001
- [ ] Admin login returns JWT token
- [ ] User login returns JWT token
- [ ] Protected endpoints require authentication
- [ ] Admin endpoints require admin role

## 🔧 Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `baseUrl` | `http://localhost:3001/api` | API base URL |
| `authToken` | `(auto-set)` | Current user token |
| `adminToken` | `(auto-set)` | Admin user token |

## 🧪 Test Credentials

### Admin Users
- **Email**: `admin@example.com` | **Password**: `Admin123!`
- **Email**: `admin@demo.com` | **Password**: `DemoAdmin123!`

### Regular Users  
- **Email**: `john@example.com` | **Password**: `Password123!`
- **Email**: `alice@demo.com` | **Password**: `Alice123!`

## 📋 Collection Structure

```
🔐 Authentication (10 endpoints)
├── Register User
├── Login Admin (saves admin token)
├── Login User (saves user token)
├── Change Password
├── Forgot Password
├── Reset Password
├── Verify Email
├── Resend Email Verification
├── Get Profile
├── Refresh Token
└── Get Current User

👤 User Management (9 endpoints)
├── Create User (Admin)
├── Get All Users (Admin)
├── Get Own Profile
├── Update Own Profile
├── Get User by ID (Admin)
├── Update User (Admin)
├── Delete User (Admin)
├── Deactivate User (Admin)
└── Activate User (Admin)

🌱 Database Seeding (3 endpoints)
├── Seed Database (Admin)
├── Clear Database (Admin)
└── Reset Database (Admin)
```

## 🎯 Testing Workflow

### Basic Authentication Flow
```
1. Login Admin → Token saved automatically
2. Get All Users → Verify admin access
3. Login User → Switch to user token
4. Get Profile → Verify user access
```

### Complete User Management Test
```
1. Login Admin
2. Seed Database → Populate test data
3. Get All Users → View seeded users
4. Create User → Add new user
5. Update User → Modify user data
6. Deactivate User → Test status change
7. Delete User → Remove user
```

### Password Management Test
```
1. Login User
2. Change Password → Update password
3. Login with new password → Verify change
4. Forgot Password → Request reset
5. Reset Password → Complete flow
```

## 🔍 Troubleshooting

### Import Issues
- **Format not recognized**: Use OpenAPI 3.0 format
- **Missing endpoints**: Check file path and content
- **Invalid JSON**: Validate JSON syntax

### Authentication Issues
- **401 Unauthorized**: Check token is saved correctly
- **403 Forbidden**: Verify user has required role
- **Token not saved**: Check post-request scripts

### Connection Issues
- **Connection refused**: Ensure API server is running
- **Wrong port**: Verify baseUrl is correct
- **CORS errors**: Check server CORS configuration

## 📱 Mobile Testing

ApiDog supports mobile testing. Configure the same environment variables:
```json
{
  "baseUrl": "http://your-server-ip:3001/api",
  "authToken": "",
  "adminToken": ""
}
```

## 🔄 CI/CD Integration

Export collection for automated testing:
```bash
# Export collection
File → Export → Postman Collection v2.1

# Use with Newman
npm install -g newman
newman run collection.json -e environment.json
```

## 📊 Response Validation

The collection includes automatic response validation:
- Status code checks
- Response time monitoring
- JSON schema validation
- Token extraction and storage

## 🎨 Customization

### Adding Custom Tests
```javascript
// Test Script Example
pm.test("Login successful", function () {
    pm.response.to.have.status(200);
    const response = pm.response.json();
    pm.expect(response).to.have.property('access_token');
    pm.collectionVariables.set('authToken', response.access_token);
});
```

### Custom Pre-request Scripts
```javascript
// Pre-request Script Example
const timestamp = Date.now();
pm.globals.set('timestamp', timestamp);
```

## 🚨 Security Notes

- Never commit real tokens to version control
- Use environment-specific credentials
- Rotate tokens regularly in production
- Test with expired tokens to verify handling

## 📞 Support

If you encounter issues:
1. Check the API server logs
2. Verify database connection
3. Validate request format
4. Review authentication setup

---

**Ready to test! 🚀**

Your NestJS Authentication API is now fully documented and ready for testing in ApiDog.
