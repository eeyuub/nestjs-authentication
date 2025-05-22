import { Injectable, UnauthorizedException, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);
      
      // Check if user is active
      if (!user.isActive) {
        return null;
      }
      
      const isPasswordValid = await user.validatePassword(password);
      
      if (isPasswordValid) {
        // Update last login timestamp
        user.updateLastLogin();
        await this.usersService.save(user);
        
        const { password, ...result } = user;
        return result;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const payload = { email: user.email, sub: user.id, roles: user.roles };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      },
    };
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    
    // Send welcome email
    try {
      await this.emailService.sendWelcomeEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
      );
    } catch (error) {
      // Log error but don't fail registration
      console.error('Failed to send welcome email:', error);
    }
    
    const payload = { email: user.email, sub: user.id, roles: user.roles };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const user = await this.usersService.findByEmail(forgotPasswordDto.email);
      
      // Generate reset token
      const resetToken = uuidv4();
      
      // Set token expiration (1 hour from now)
      const expiresIn = new Date();
      expiresIn.setHours(expiresIn.getHours() + 1);
      
      // Save token to user
      user.setPasswordResetToken(resetToken, expiresIn);
      await this.usersService.save(user);
      
      // Send password reset email
      await this.emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        `${user.firstName} ${user.lastName}`,
      );
      
      return { message: 'Password reset email sent' };
    } catch (error) {
      // Always return success to prevent email enumeration
      return { message: 'Password reset email sent' };
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    // Find user by reset token
    const user = await this.usersService.findByResetToken(resetPasswordDto.token);
    
    if (!user) {
      throw new NotFoundException('Invalid or expired reset token');
    }
    
    // Check if token is expired
    if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }
    
    // Change password
    await user.changePassword(resetPasswordDto.password);
    await this.usersService.save(user);
    
    return { message: 'Password reset successful' };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.usersService.findOne(userId);
    
    // Verify current password
    const isPasswordValid = await user.validatePassword(
      changePasswordDto.currentPassword,
    );
    
    if (!isPasswordValid) {
      throw new ForbiddenException('Current password is incorrect');
    }
    
    // Change password
    await user.changePassword(changePasswordDto.newPassword);
    await this.usersService.save(user);
    
    return { message: 'Password changed successfully' };
  }

  async closeAccount(userId: string) {
    const user = await this.usersService.findOne(userId);
    
    user.closeAccount();
    await this.usersService.save(user);
    
    return { message: 'Account closed successfully' };
  }

  async reactivateAccount(userId: string) {
    const user = await this.usersService.findOne(userId);
    
    user.reactivateAccount();
    await this.usersService.save(user);
    
    return { message: 'Account reactivated successfully' };
  }
}