import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { IsStrongPassword, IsNotCommonPassword } from '../../common/decorators/validation.decorators';

export class ChangePasswordDto {
  @IsString({ message: 'Current password must be a string' })
  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword: string;

  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @IsStrongPassword({ message: 'New password is not strong enough' })
  @IsNotCommonPassword({ message: 'New password is too common' })
  newPassword: string;
}
