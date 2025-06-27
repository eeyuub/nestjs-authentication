import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { AuthenticatedUser } from './decorators/authenticated-user.decorator';
import {
  AuthRateLimit,
  LoginRateLimit,
  PasswordResetRateLimit,
  EmailVerificationRateLimit,
} from '../common/decorators/rate-limit.decorators';
import { User } from '../user/entities/user.entity';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @AuthRateLimit()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Public()
  @LoginRateLimit()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @PasswordResetRateLimit()
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @AuthenticatedUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.authService.changePassword(user, changePasswordDto);
    return { message: 'Password changed successfully' };
  }

  @Public()
  @PasswordResetRateLimit()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto);
    return { message: 'If the email exists, a password reset link has been sent' };
  }

  @Public()
  @PasswordResetRateLimit()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto);
    return { message: 'Password reset successfully' };
  }

  @Public()
  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Query('token') token: string) {
    await this.authService.verifyEmail(token);
    return { message: 'Email verified successfully' };
  }

  @Public()
  @EmailVerificationRateLimit()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body('email') email: string) {
    await this.authService.resendEmailVerification(email);
    return { message: 'Verification email sent' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@AuthenticatedUser() user: User) {
    return user;
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @AuthRateLimit()
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return await this.authService.refreshToken(refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@AuthenticatedUser() user: User) {
    return user;
  }
}
