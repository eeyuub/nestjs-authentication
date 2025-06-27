import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../user/entities/user.entity';

@Injectable()
export class UserSeeder {
  private readonly logger = new Logger(UserSeeder.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seedUsers(): Promise<void> {
    this.logger.log('Starting user seeding...');

    const existingUsers = await this.userRepository.count();
    if (existingUsers > 0) {
      this.logger.log(`Database already has ${existingUsers} users. Skipping seeding.`);
      return;
    }

    const saltRounds = 12;
    const users = [
      // Admin Users
      {
        email: 'admin@example.com',
        firstName: 'Super',
        lastName: 'Admin',
        password: await bcrypt.hash('Admin123!', saltRounds),
        role: UserRole.ADMIN,
        isEmailVerified: true,
      },
      {
        email: 'admin@demo.com',
        firstName: 'Demo',
        lastName: 'Administrator',
        password: await bcrypt.hash('DemoAdmin123!', saltRounds),
        role: UserRole.ADMIN,
        isEmailVerified: true,
      },

      // Regular Users
      {
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: await bcrypt.hash('Password123!', saltRounds),
        role: UserRole.USER,
        isEmailVerified: true,
      },
      {
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        password: await bcrypt.hash('Password123!', saltRounds),
        role: UserRole.USER,
        isEmailVerified: true,
      },
      {
        email: 'alice@demo.com',
        firstName: 'Alice',
        lastName: 'Johnson',
        password: await bcrypt.hash('Alice123!', saltRounds),
        role: UserRole.USER,
        isEmailVerified: true,
      },
      {
        email: 'bob@demo.com',
        firstName: 'Bob',
        lastName: 'Wilson',
        password: await bcrypt.hash('Bob123!', saltRounds),
        role: UserRole.USER,
        isEmailVerified: true,
      },
      {
        email: 'charlie@test.com',
        firstName: 'Charlie',
        lastName: 'Brown',
        password: await bcrypt.hash('Charlie123!', saltRounds),
        role: UserRole.USER,
        isEmailVerified: true,
      },
      {
        email: 'diana@test.com',
        firstName: 'Diana',
        lastName: 'Prince',
        password: await bcrypt.hash('Diana123!', saltRounds),
        role: UserRole.USER,
        isEmailVerified: true,
      },
      {
        email: 'eve@example.com',
        firstName: 'Eve',
        lastName: 'Davis',
        password: await bcrypt.hash('Eve123!', saltRounds),
        role: UserRole.USER,
        isEmailVerified: true,
      },
      {
        email: 'frank@demo.com',
        firstName: 'Frank',
        lastName: 'Miller',
        password: await bcrypt.hash('Frank123!', saltRounds),
        role: UserRole.USER,
        isEmailVerified: true,
      },
      {
        email: 'grace@test.com',
        firstName: 'Grace',
        lastName: 'Lee',
        password: await bcrypt.hash('Grace123!', saltRounds),
        role: UserRole.USER,
        isEmailVerified: true,
      },
      {
        email: 'henry@example.com',
        firstName: 'Henry',
        lastName: 'Taylor',
        password: await bcrypt.hash('Henry123!', saltRounds),
        role: UserRole.USER,
        isEmailVerified: true,
      },

      // Test Users (some unverified)
      {
        email: 'test1@example.com',
        firstName: 'Test',
        lastName: 'User1',
        password: await bcrypt.hash('Test123!', saltRounds),
        role: UserRole.USER,
        isEmailVerified: false,
      },
      {
        email: 'test2@example.com',
        firstName: 'Test',
        lastName: 'User2',
        password: await bcrypt.hash('Test123!', saltRounds),
        role: UserRole.USER,
        isEmailVerified: false,
      },
      {
        email: 'inactive@example.com',
        firstName: 'Inactive',
        lastName: 'User',
        password: await bcrypt.hash('Inactive123!', saltRounds),
        role: UserRole.USER,
        isEmailVerified: true,
        isActive: false,
      },
    ];

    try {
      for (const userData of users) {
        const user = this.userRepository.create(userData);
        await this.userRepository.save(user);
        this.logger.log(`Created user: ${userData.email} (${userData.role})`);
      }

      this.logger.log(`Successfully seeded ${users.length} users`);
    } catch (error) {
      this.logger.error('Error seeding users:', error);
      throw error;
    }
  }

  async clearUsers(): Promise<void> {
    this.logger.log('Clearing all users...');
    await this.userRepository.clear();
    this.logger.log('All users cleared');
  }

  async resetUsers(): Promise<void> {
    await this.clearUsers();
    await this.seedUsers();
  }
}
