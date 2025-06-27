-- PostgreSQL Database Setup Script for NestJS Auth API
-- Run this script to create the database and initial setup

-- Create database (run this as postgres superuser)
-- CREATE DATABASE nestjs_auth;

-- Connect to the nestjs_auth database and run the following:

-- Create users table (this will be auto-created by TypeORM sync, but here for reference)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    "isActive" BOOLEAN DEFAULT true,
    "resetPasswordToken" VARCHAR(255),
    "resetPasswordExpires" TIMESTAMP,
    "emailVerificationToken" VARCHAR(255),
    "isEmailVerified" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users("isActive");
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users("resetPasswordToken");
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users("emailVerificationToken");

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a default admin user (password: Admin123!)
-- Note: This is just for development. In production, create admin users through the API
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@example.com') THEN
        INSERT INTO users (email, "firstName", "lastName", password, role, "isEmailVerified")
        VALUES (
            'admin@example.com',
            'Admin',
            'User',
            -- BCrypt hash for 'Admin123!' (salt rounds: 12)
            '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGKGQ5JMQJQQyAS',
            'admin',
            true
        );
    END IF;
END $$;
