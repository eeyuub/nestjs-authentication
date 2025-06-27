# 🌱 Seeded Users Credentials

This document contains all the seeded users with their login credentials for easy testing and development.

## 👑 Admin Users

### Super Admin
- **Email**: `admin@example.com`
- **Password**: `Admin123!`
- **Role**: Admin
- **Status**: Active, Email Verified

### Demo Administrator
- **Email**: `admin@demo.com`
- **Password**: `DemoAdmin123!`
- **Role**: Admin
- **Status**: Active, Email Verified

---

## 👤 Regular Users

### Standard Users (Password: Password123!)
- **Email**: `john@example.com` | **Name**: John Doe
- **Email**: `jane@example.com` | **Name**: Jane Smith

### Named Users (Password: [FirstName]123!)
- **Email**: `alice@demo.com` | **Password**: `Alice123!` | **Name**: Alice Johnson
- **Email**: `bob@demo.com` | **Password**: `Bob123!` | **Name**: Bob Wilson
- **Email**: `charlie@test.com` | **Password**: `Charlie123!` | **Name**: Charlie Brown
- **Email**: `diana@test.com` | **Password**: `Diana123!` | **Name**: Diana Prince
- **Email**: `eve@example.com` | **Password**: `Eve123!` | **Name**: Eve Davis
- **Email**: `frank@demo.com` | **Password**: `Frank123!` | **Name**: Frank Miller
- **Email**: `grace@test.com` | **Password**: `Grace123!` | **Name**: Grace Lee
- **Email**: `henry@example.com` | **Password**: `Henry123!` | **Name**: Henry Taylor

---

## 🧪 Test Users

### Test Users (Unverified Email)
- **Email**: `test1@example.com` | **Password**: `Test123!` | **Name**: Test User1
- **Email**: `test2@example.com` | **Password**: `Test123!` | **Name**: Test User2

### Inactive User
- **Email**: `inactive@example.com` | **Password**: `Inactive123!` | **Name**: Inactive User
- **Status**: ❌ Inactive Account

---

## 🚀 Quick Test Commands

### Login as Admin
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'
```

### Login as Regular User
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

### Login as Demo Admin
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "DemoAdmin123!"
  }'
```

---

## 📊 Summary

- **Total Users**: 15
- **Admin Users**: 2
- **Regular Users**: 10
- **Test Users**: 2
- **Inactive Users**: 1
- **Verified Users**: 13
- **Unverified Users**: 2

---

## 🛠️ Seeder Commands

### Run Seeder
```bash
# Seed the database (only if empty)
pnpm run seed

# Clear all users
pnpm run seed:clear

# Reset (clear + seed)
pnpm run seed:reset
```

### API Endpoints (Admin Only)
```bash
# Seed via API (requires admin JWT token)
POST /api/seeders/seed
POST /api/seeders/clear
POST /api/seeders/reset
```

---

## 💡 Notes

- All passwords follow the pattern: `[Name/Type]123!`
- Admin passwords are more complex for security
- Test users have simple `Test123!` password
- Email verification tokens are cleared for verified users
- All users have realistic names for better testing experience
