import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

      // Create user
      const user = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
        emailVerificationToken: uuidv4(),
      });

      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create user');
    }
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { 
        resetPasswordToken: token,
      },
    });
  }

  async findByEmailVerificationToken(token: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check if email is being updated and if it's already taken
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('Email is already taken');
      }
    }

    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async updatePassword(id: number, newPassword: string): Promise<void> {
    const user = await this.findOne(id);
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    user.password = hashedPassword;
    await this.userRepository.save(user);
  }

  async setResetPasswordToken(id: number): Promise<string> {
    const user = await this.findOne(id);
    const resetToken = uuidv4();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour expiry

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await this.userRepository.save(user);

    return resetToken;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.findByResetToken(token);
    
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await this.userRepository.save(user);
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.findByEmailVerificationToken(token);
    
    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    await this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async updateRefreshToken(id: number, refreshToken: string, expires: Date): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(id, {
      refreshToken: hashedRefreshToken,
      refreshTokenExpires: expires,
    });
  }

  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    const users = await this.userRepository.find({
      where: {
        refreshTokenExpires: MoreThan(new Date()),
      },
    });

    for (const user of users) {
      if (user.refreshToken && await bcrypt.compare(refreshToken, user.refreshToken)) {
        return user;
      }
    }

    return null;
  }

  async clearRefreshToken(id: number): Promise<void> {
    await this.userRepository.update(id, {
      refreshToken: null,
      refreshTokenExpires: null,
    });
  }

  async deactivate(id: number): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = false;
    return await this.userRepository.save(user);
  }

  async activate(id: number): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = true;
    return await this.userRepository.save(user);
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
