import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { EmailService } from './services/email.service';
import { User } from '../user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { logAuditEvent } from '../config/logging.config';
import * as crypto from 'crypto';

export interface LoginResponse {
  access_token: string;
  user: Omit<User, 'password' | 'resetPasswordToken' | 'resetPasswordExpires' | 'emailVerificationToken'>;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.userService.findByEmail(email);
      
      if (!user) {
        return null;
      }

      if (!user.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      const isPasswordValid = await this.userService.validatePassword(password, user.password);
      
      if (!isPasswordValid) {
        return null;
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      return null;
    }
  }

  async register(registerDto: RegisterDto): Promise<LoginResponse> {
    try {
      const user = await this.userService.create(registerDto);
      
      // Send email verification
      if (user.emailVerificationToken) {
        try {
          await this.emailService.sendEmailVerification(user.email, user.emailVerificationToken);
        } catch (error) {
          // Log error but don't fail registration
          console.error('Failed to send verification email:', error);
        }
      }

      return this.generateTokenResponse(user);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Registration failed');
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokenResponse(user);
  }

  async changePassword(user: User, changePasswordDto: ChangePasswordDto): Promise<void> {
    const isCurrentPasswordValid = await this.userService.validatePassword(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    if (changePasswordDto.currentPassword === changePasswordDto.newPassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    await this.userService.updatePassword(user.id, changePasswordDto.newPassword);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const user = await this.userService.findByEmail(forgotPasswordDto.email);
    
    if (!user) {
      // Don't reveal whether email exists or not
      return;
    }

    if (!user.isActive) {
      throw new BadRequestException('Account is deactivated');
    }

    try {
      const resetToken = await this.userService.setResetPasswordToken(user.id);
      await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      throw new BadRequestException('Failed to send password reset email');
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    try {
      await this.userService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to reset password');
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      await this.userService.verifyEmail(token);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to verify email');
    }
  }

  async resendEmailVerification(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    if (!user.emailVerificationToken) {
      throw new BadRequestException('No verification token available');
    }

    try {
      await this.emailService.sendEmailVerification(user.email, user.emailVerificationToken);
    } catch (error) {
      throw new BadRequestException('Failed to send verification email');
    }
  }

  private async generateTokenResponse(user: User, ip?: string, userAgent?: string): Promise<LoginResponse & { refresh_token: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.generateRefreshToken();
    
    // Store refresh token with expiration
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7); // 7 days
    
    await this.userService.updateRefreshToken(user.id, refresh_token, refreshTokenExpires);

    // Log successful authentication
    logAuditEvent({
      userId: user.id,
      action: 'AUTH_SUCCESS',
      resource: 'authentication',
      success: true,
      ip,
      userAgent,
      details: { method: 'login' },
    });

    // Remove sensitive fields from user object
    const { password, resetPasswordToken, resetPasswordExpires, emailVerificationToken, refreshToken, ...userResponse } = user;

    return {
      access_token,
      refresh_token,
      user: userResponse,
    };
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async refreshToken(refreshToken: string, ip?: string, userAgent?: string): Promise<LoginResponse & { refresh_token: string }> {
    const user = await this.userService.findByRefreshToken(refreshToken);
    
    if (!user) {
      logAuditEvent({
        action: 'REFRESH_TOKEN_INVALID',
        resource: 'authentication',
        success: false,
        ip,
        userAgent,
        error: 'Invalid refresh token',
      });
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!user.refreshTokenExpires || user.refreshTokenExpires < new Date()) {
      logAuditEvent({
        userId: user.id,
        action: 'REFRESH_TOKEN_EXPIRED',
        resource: 'authentication',
        success: false,
        ip,
        userAgent,
        error: 'Refresh token expired',
      });
      // Clear expired refresh token
      await this.userService.clearRefreshToken(user.id);
      throw new UnauthorizedException('Refresh token expired');
    }

    if (!user.isActive) {
      logAuditEvent({
        userId: user.id,
        action: 'REFRESH_TOKEN_INACTIVE_USER',
        resource: 'authentication',
        success: false,
        ip,
        userAgent,
        error: 'User account inactive',
      });
      throw new UnauthorizedException('User account is deactivated');
    }

    // Generate new tokens (refresh token rotation)
    return this.generateTokenResponse(user, ip, userAgent);
  }

  async logout(user: User, ip?: string, userAgent?: string): Promise<void> {
    await this.userService.clearRefreshToken(user.id);
    
    logAuditEvent({
      userId: user.id,
      action: 'LOGOUT',
      resource: 'authentication',
      success: true,
      ip,
      userAgent,
    });
  }
}
