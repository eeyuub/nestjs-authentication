import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, CreateDateColumn, UpdateDateColumn, BeforeUpdate } from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { Role } from '../enums/role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  @Exclude()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: [Role.USER],
    array: true,
    enumName: 'user_role_enum'
  })
  roles: Role[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  @Exclude()
  passwordResetToken: string;

  @Column({ nullable: true })
  @Exclude()
  passwordResetExpires: Date;

  @Column({ nullable: true })
  @Exclude()
  lastLogin: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  @BeforeUpdate()
  async hashPasswordOnUpdate() {
    // Only hash the password if it was modified
    if (this.password && this.password.length < 60) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  /**
   * Change user password
   * @param newPassword - The new password to set
   */
  async changePassword(newPassword: string): Promise<void> {
    this.password = await bcrypt.hash(newPassword, 10);
    // Clear any reset tokens when password is changed
    this.passwordResetToken = '';
    this.passwordResetExpires = null as any;
  }

  /**
   * Close user account
   */
  closeAccount(): void {
    this.isActive = false;
  }

  /**
   * Reactivate user account
   */
  reactivateAccount(): void {
    this.isActive = true;
  }

  /**
   * Set password reset token and expiration
   * @param token - The reset token
   * @param expires - When the token expires
   */
  setPasswordResetToken(token: string, expires: Date): void {
    this.passwordResetToken = token;
    this.passwordResetExpires = expires;
  }

  /**
   * Clear password reset token
   */
  clearPasswordResetToken(): void {
    this.passwordResetToken = '';
    this.passwordResetExpires = null as any;
  }

  /**
   * Update last login timestamp
   */
  updateLastLogin(): void {
    this.lastLogin = new Date();
  }
}