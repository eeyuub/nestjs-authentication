import { Controller, Post, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { DatabaseSeeder } from './database.seeder';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user.entity';

@Controller('seeders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class SeederController {
  constructor(private readonly databaseSeeder: DatabaseSeeder) {}

  @Post('seed')
  @HttpCode(HttpStatus.OK)
  async seedDatabase() {
    await this.databaseSeeder.seedAll();
    return { message: 'Database seeded successfully' };
  }

  @Post('clear')
  @HttpCode(HttpStatus.OK)
  async clearDatabase() {
    await this.databaseSeeder.clearAll();
    return { message: 'Database cleared successfully' };
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  async resetDatabase() {
    await this.databaseSeeder.resetAll();
    return { message: 'Database reset successfully' };
  }
}
