import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(12000),
  APP_URL: Joi.string().default('http://localhost:12000'),

  // Database
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().default('postgres'),
  DB_PASSWORD: Joi.string().default('postgres'),
  DB_DATABASE: Joi.string().default('nestjs_auth'),
  DB_SYNC: Joi.boolean().default(false),

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION: Joi.string().default('1d'),

  // Email
  EMAIL_HOST: Joi.string().default('smtp.example.com'),
  EMAIL_PORT: Joi.number().default(587),
  EMAIL_USER: Joi.string().default('user@example.com'),
  EMAIL_PASSWORD: Joi.string().default('password'),
  EMAIL_FROM: Joi.string().default('noreply@example.com'),
  EMAIL_SECURE: Joi.boolean().default(false),

  // Admin
  ADMIN_EMAIL: Joi.string().email(),
  ADMIN_PASSWORD: Joi.string().min(8),
  ADMIN_FIRST_NAME: Joi.string().default('Admin'),
  ADMIN_LAST_NAME: Joi.string().default('User'),
});