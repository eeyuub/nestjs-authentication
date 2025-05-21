import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { DbModule } from './db/db.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { InitModule } from './init/init.module';

@Module({
  imports: [
    ConfigModule,
    DbModule,
    UsersModule,
    AuthModule,
    EmailModule,
    InitModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
