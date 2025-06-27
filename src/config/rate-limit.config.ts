import { ThrottlerModuleOptions } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';

export const createRateLimitConfig = (configService: ConfigService): ThrottlerModuleOptions => {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  
  return {
    throttlers: [
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: isProduction ? 3 : 10, // 3 requests per second in production, 10 in dev
      },
      {
        name: 'medium',
        ttl: 10000, // 10 seconds
        limit: isProduction ? 20 : 100, // 20 requests per 10 seconds in production
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: isProduction ? 100 : 1000, // 100 requests per minute in production
      },
    ],
  };
};
