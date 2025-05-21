import { Module } from '@nestjs/common';
import { InitService } from './init.service';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UsersModule, ConfigModule],
  providers: [InitService],
})
export class InitModule {}