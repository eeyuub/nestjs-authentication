import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class InitService implements OnModuleInit {
  private readonly logger = new Logger(InitService.name);

  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.createDefaultAdmin();
  }

  private async createDefaultAdmin() {
    try {
      const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
      const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');
      const adminFirstName = this.configService.get<string>('ADMIN_FIRST_NAME', 'Admin');
      const adminLastName = this.configService.get<string>('ADMIN_LAST_NAME', 'User');

      if (!adminEmail || !adminPassword) {
        this.logger.warn(
          'ADMIN_EMAIL or ADMIN_PASSWORD not set. Skipping default admin creation.',
        );
        return;
      }

      const admin = await this.usersService.createDefaultAdminIfNotExists(
        adminEmail,
        adminPassword,
        adminFirstName,
        adminLastName,
      );

      if (admin) {
        this.logger.log(`Default admin user created: ${admin.email}`);
      } else {
        this.logger.log('Admin user already exists. Skipping creation.');
      }
    } catch (error) {
      this.logger.error('Failed to create default admin user', error.stack);
    }
  }
}