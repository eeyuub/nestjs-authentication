import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../src/user/entities/user.entity';
import { UserRole } from '../src/user/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix('api');
    
    dataSource = moduleFixture.get<DataSource>(DataSource);
    userRepository = dataSource.getRepository(User);
    
    await app.init();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await userRepository.delete({});
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('/api/auth/register (POST)', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('verification email');

      // Verify user was created in database
      const user = await userRepository.findOne({
        where: { email: registerDto.email },
      });
      expect(user).toBeDefined();
      expect(user.email).toBe(registerDto.email);
      expect(user.firstName).toBe(registerDto.firstName);
      expect(user.lastName).toBe(registerDto.lastName);
      expect(user.isEmailVerified).toBe(false);
    });

    it('should reject registration with invalid email', async () => {
      const registerDto = {
        email: 'invalid-email',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(400);
    });

    it('should reject registration with weak password', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: '123',
        firstName: 'John',
        lastName: 'Doe',
      };

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(400);
    });

    it('should reject registration with duplicate email', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      // First registration
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(201);

      // Second registration with same email
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(400);
    });
  });

  describe('/api/auth/login (POST)', () => {
    beforeEach(async () => {
      // Create a verified user for login tests
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      const user = userRepository.create({
        email: 'verified@example.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.USER,
        isEmailVerified: true,
      });
      await userRepository.save(user);
    });

    it('should login successfully with valid credentials', async () => {
      const loginDto = {
        email: 'verified@example.com',
        password: 'Password123!',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginDto.email);
    });

    it('should reject login with invalid email', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginDto)
        .expect(401);
    });

    it('should reject login with invalid password', async () => {
      const loginDto = {
        email: 'verified@example.com',
        password: 'WrongPassword!',
      };

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginDto)
        .expect(401);
    });

    it('should reject login for unverified email', async () => {
      // Create unverified user
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      const user = userRepository.create({
        email: 'unverified@example.com',
        password: hashedPassword,
        firstName: 'Jane',
        lastName: 'Doe',
        role: UserRole.USER,
        isEmailVerified: false,
      });
      await userRepository.save(user);

      const loginDto = {
        email: 'unverified@example.com',
        password: 'Password123!',
      };

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginDto)
        .expect(401);
    });
  });

  describe('/api/auth/profile (GET)', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Create a verified user and get access token
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      const user = userRepository.create({
        email: 'profile@example.com',
        password: hashedPassword,
        firstName: 'Profile',
        lastName: 'User',
        role: UserRole.USER,
        isEmailVerified: true,
      });
      await userRepository.save(user);

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'profile@example.com',
          password: 'Password123!',
        });

      accessToken = loginResponse.body.access_token;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('profile@example.com');
      expect(response.body.firstName).toBe('Profile');
      expect(response.body.lastName).toBe('User');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should reject profile request without token', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/profile')
        .expect(401);
    });

    it('should reject profile request with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/api/auth/refresh (POST)', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Create a verified user and get refresh token
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      const user = userRepository.create({
        email: 'refresh@example.com',
        password: hashedPassword,
        firstName: 'Refresh',
        lastName: 'User',
        role: UserRole.USER,
        isEmailVerified: true,
      });
      await userRepository.save(user);

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'refresh@example.com',
          password: 'Password123!',
        });

      refreshToken = loginResponse.body.refresh_token;
    });

    it('should refresh tokens with valid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refresh_token: refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
      expect(response.body.access_token).toBeDefined();
      expect(response.body.refresh_token).toBeDefined();
    });

    it('should reject refresh with invalid token', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refresh_token: 'invalid-token' })
        .expect(401);
    });
  });

  describe('/api/auth/change-password (POST)', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Create a verified user and get access token
      const hashedPassword = await bcrypt.hash('OldPassword123!', 10);
      const user = userRepository.create({
        email: 'changepass@example.com',
        password: hashedPassword,
        firstName: 'Change',
        lastName: 'Password',
        role: UserRole.USER,
        isEmailVerified: true,
      });
      await userRepository.save(user);

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'changepass@example.com',
          password: 'OldPassword123!',
        });

      accessToken = loginResponse.body.access_token;
    });

    it('should change password successfully', async () => {
      const changePasswordDto = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
      };

      await request(app.getHttpServer())
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(changePasswordDto)
        .expect(200);

      // Verify login with new password works
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'changepass@example.com',
          password: 'NewPassword123!',
        })
        .expect(200);

      // Verify login with old password fails
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'changepass@example.com',
          password: 'OldPassword123!',
        })
        .expect(401);
    });

    it('should reject password change with wrong current password', async () => {
      const changePasswordDto = {
        currentPassword: 'WrongPassword!',
        newPassword: 'NewPassword123!',
      };

      await request(app.getHttpServer())
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(changePasswordDto)
        .expect(400);
    });

    it('should reject password change without authentication', async () => {
      const changePasswordDto = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
      };

      await request(app.getHttpServer())
        .post('/api/auth/change-password')
        .send(changePasswordDto)
        .expect(401);
    });
  });

  describe('/api/auth/forgot-password (POST)', () => {
    beforeEach(async () => {
      // Create a verified user for password reset
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      const user = userRepository.create({
        email: 'forgot@example.com',
        password: hashedPassword,
        firstName: 'Forgot',
        lastName: 'Password',
        role: UserRole.USER,
        isEmailVerified: true,
      });
      await userRepository.save(user);
    });

    it('should send password reset email for valid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: 'forgot@example.com' })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('reset email');

      // Verify reset token was set in database
      const user = await userRepository.findOne({
        where: { email: 'forgot@example.com' },
      });
      expect(user.resetToken).toBeDefined();
      expect(user.resetTokenExpiry).toBeDefined();
    });

    it('should handle forgot password for non-existent email gracefully', async () => {
      // Should not reveal whether email exists or not
      await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);
    });
  });

  describe('Role-based Access Control', () => {
    let userToken: string;
    let adminToken: string;

    beforeEach(async () => {
      // Create regular user
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      const user = userRepository.create({
        email: 'user@example.com',
        password: hashedPassword,
        firstName: 'Regular',
        lastName: 'User',
        role: UserRole.USER,
        isEmailVerified: true,
      });
      await userRepository.save(user);

      // Create admin user
      const admin = userRepository.create({
        email: 'admin@example.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        isEmailVerified: true,
      });
      await userRepository.save(admin);

      // Get tokens
      const userLogin = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'Password123!',
        });
      userToken = userLogin.body.access_token;

      const adminLogin = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'Password123!',
        });
      adminToken = adminLogin.body.access_token;
    });

    it('should allow admin to access admin endpoints', async () => {
      await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should deny regular user access to admin endpoints', async () => {
      await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should allow both users to access user endpoints', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });
});
