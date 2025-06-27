import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from '../../user/entities/user.entity';
import { UserSeeder } from './user.seeder';
import { DatabaseSeeder } from './database.seeder';
import { SeederController } from './seeder.controller';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [SeederController],
  providers: [UserSeeder, DatabaseSeeder],
  exports: [UserSeeder, DatabaseSeeder],
})
export class SeederModule {}
