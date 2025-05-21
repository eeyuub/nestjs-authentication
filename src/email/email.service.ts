import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    // Create reusable transporter object using SMTP transport
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: this.configService.get<boolean>('EMAIL_SECURE', false),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  /**
   * Send an email
   * @param to - Recipient email address
   * @param subject - Email subject
   * @param template - Template name (without extension)
   * @param context - Template context data
   */
  async sendEmail(
    to: string,
    subject: string,
    template: string,
    context: any,
  ): Promise<void> {
    try {
      // Get template path
      const templatePath = path.join(
        __dirname,
        'templates',
        `${template}.hbs`,
      );

      // Read template file
      const templateSource = fs.readFileSync(templatePath, 'utf8');

      // Compile template
      const compiledTemplate = handlebars.compile(templateSource);

      // Render template with context
      const html = compiledTemplate(context);

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

    await this.sendEmail(to, 'Password Reset', 'password-reset', {
      name: userName,
      resetUrl,
      expiresIn: '1 hour',
    });
  }

  /**
   * Send welcome email
   * @param to - Recipient email address
   * @param userName - User's name
   */
  async sendWelcomeEmail(to: string, userName: string): Promise<void> {
    await this.sendEmail(to, 'Welcome to NestJS Auth', 'welcome', {
      name: userName,
      loginUrl: `${this.configService.get<string>('FRONTEND_URL')}/login`,
    });
  }
}