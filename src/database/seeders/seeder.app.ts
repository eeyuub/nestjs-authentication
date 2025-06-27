import { NestFactory } from '@nestjs/core';
import { DatabaseSeeder } from './database.seeder';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from '../../config/database.config';
import { Logger, Module } from '@nestjs/common';
import { SeederModule } from './seeder.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    SeederModule,
  ],
})
class SeederAppModule {}

async function runSeeder() {
  const logger = new Logger('SeederApp');

  try {

    const app = await NestFactory.createApplicationContext(SeederAppModule);
    const seeder = app.get(DatabaseSeeder);

    const command = process.argv[2];

    switch (command) {
      case 'seed':
        await seeder.seedAll();
        break;
      case 'clear':
        await seeder.clearAll();
        break;
      case 'reset':
        await seeder.resetAll();
        break;
      default:
        logger.log('Available commands:');
        logger.log('  seed  - Add sample data to database');
        logger.log('  clear - Remove all data from database');
        logger.log('  reset - Clear and then seed database');
        break;
    }

    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error('Seeder failed:', error);
    process.exit(1);
  }
}

runSeeder();
