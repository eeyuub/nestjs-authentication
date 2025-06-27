import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '../entities/user.entity';
import { IsStrongPassword, IsNotCommonPassword, IsValidName } from '../../common/decorators/validation.decorators';
import { Sanitize } from 'class-sanitizer';

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @IsValidName({ message: 'First name contains invalid characters' })
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @IsValidName({ message: 'Last name contains invalid characters' })
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsStrongPassword({ message: 'Password is not strong enough' })
  @IsNotCommonPassword({ message: 'Password is too common' })
  password: string;

  @IsEnum(UserRole, { message: 'Role must be either user or admin' })
  @IsOptional()
  role?: UserRole = UserRole.USER;
}
