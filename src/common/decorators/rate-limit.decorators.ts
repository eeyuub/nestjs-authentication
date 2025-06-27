import { applyDecorators } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

// Strict rate limiting for sensitive auth operations
export const AuthRateLimit = () =>
  applyDecorators(
    Throttle({ default: { ttl: 1000, limit: 2 } }), // 2 per second (most restrictive)
  );

// Moderate rate limiting for login attempts
export const LoginRateLimit = () =>
  applyDecorators(
    Throttle({ default: { ttl: 1000, limit: 1 } }), // 1 per second
  );

// Strict rate limiting for password reset requests
export const PasswordResetRateLimit = () =>
  applyDecorators(
    Throttle({ default: { ttl: 300000, limit: 3 } }), // 3 per 5 minutes
  );

// Alias for password reset rate limit
export const PasswordRateLimit = PasswordResetRateLimit;

// Moderate rate limiting for email verification
export const EmailVerificationRateLimit = () =>
  applyDecorators(
    Throttle({ default: { ttl: 60000, limit: 3 } }), // 3 per minute
  );

// Alias for email verification rate limit
export const EmailRateLimit = EmailVerificationRateLimit;

// Standard rate limiting for general API endpoints
export const StandardRateLimit = () =>
  applyDecorators(
    Throttle({ default: { ttl: 1000, limit: 10 } }), // 10 per second
  );
