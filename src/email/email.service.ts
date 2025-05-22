import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { generatePasswordResetEmail } from './templates/password-reset.template';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    // Create reusable transporter object using SMTP transport
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('EMAIL_HOST'),
      port: this.configService.get('EMAIL_PORT'),
      secure: this.configService.get('EMAIL_SECURE', false),
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  /**
   * Send an email
   * @param to - Recipient email address
   * @param subject - Email subject
   * @param html - Email HTML content
   */
  async sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    try {
      // Send email
      await this.transporter.sendMail({
        from: `"${this.configService.get<string>(
          'EMAIL_FROM_NAME',
          'NestJS Auth',
        )}" <${this.configService.get<string>('EMAIL_FROM')}>`,
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error.stack);
      throw error;
    }
  }

  /**
   * Send password reset email
   * @param to - Recipient email address
   * @param resetToken - Password reset token
   * @param userName - User's name
   */
  async sendPasswordResetEmail(
    to: string,
    resetToken: string,
    userName: string,
  ): Promise<void> {
    const resetUrl = `${this.configService.get<string>(
      'FRONTEND_URL',
    )}/reset-password?token=${resetToken}`;

    const html = generatePasswordResetEmail({
      name: userName,
      resetUrl,
      expiresIn: '1 hour',
    });

    await this.sendEmail(to, 'Password Reset', html);
  }

  /**
   * Send welcome email
   * @param to - Recipient email address
   * @param userName - User's name
   */
  async sendWelcomeEmail(to: string, userName: string): Promise<void> {
    // Simple welcome email for now
    const html = `
      <h1>Welcome to NestJS Auth!</h1>
      <p>Hello ${userName},</p>
      <p>Thank you for registering with us.</p>
      <p>You can log in at: <a href="${this.configService.get<string>('FRONTEND_URL')}/login">Login</a></p>
      <p>Best regards,<br>The NestJS Auth Team</p>
    `;
    
    await this.sendEmail(to, 'Welcome to NestJS Auth', html);
  }
}