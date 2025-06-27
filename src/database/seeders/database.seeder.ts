import { Injectable, Logger } from '@nestjs/common';
import { UserSeeder } from './user.seeder';

@Injectable()
export class DatabaseSeeder {
  private readonly logger = new Logger(DatabaseSeeder.name);

  constructor(private readonly userSeeder: UserSeeder) {}

  async seedAll(): Promise<void> {
    this.logger.log('🌱 Starting database seeding...');

    try {
      await this.userSeeder.seedUsers();
      this.logger.log('✅ Database seeding completed successfully!');
    } catch (error) {
      this.logger.error('❌ Error during database seeding:', error);
      throw error;
    }
  }

  async clearAll(): Promise<void> {
    this.logger.log('🧹 Starting database clearing...');

    try {
      await this.userSeeder.clearUsers();
      this.logger.log('✅ Database clearing completed successfully!');
    } catch (error) {
      this.logger.error('❌ Error during database clearing:', error);
      throw error;
    }
  }

  async resetAll(): Promise<void> {
    this.logger.log('🔄 Starting database reset...');

    try {
      await this.userSeeder.resetUsers();
      this.logger.log('✅ Database reset completed successfully!');
    } catch (error) {
      this.logger.error('❌ Error during database reset:', error);
      throw error;
    }
  }
}
