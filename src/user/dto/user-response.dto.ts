import { Exclude, Expose } from 'class-transformer';
import { UserRole } from '../entities/user.entity';

export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  role: UserRole;

  @Expose()
  isActive: boolean;

  @Expose()
  isEmailVerified: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Exclude()
  password: string;

  @Exclude()
  resetPasswordToken?: string;

  @Exclude()
  resetPasswordExpires?: Date;

  @Exclude()
  emailVerificationToken?: string;
}
