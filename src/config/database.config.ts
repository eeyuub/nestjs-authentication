import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  
  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME', 'postgres'),
    password: configService.get<string>('DB_PASSWORD', 'password'),
    database: configService.get<string>('DB_NAME', 'nestjs_auth'),
    entities: [User],
    synchronize: !isProduction, // Only sync in development
    logging: configService.get<string>('NODE_ENV') === 'development',
    autoLoadEntities: true,
    retryAttempts: 3,
    retryDelay: 3000,
    // Connection pool settings
    extra: {
      max: 20, // Maximum number of connections in the pool
      min: 5,  // Minimum number of connections in the pool
      idle: 10000, // Maximum time a connection can be idle before being released
      acquire: 30000, // Maximum time to wait for a connection
    },
  };
};
