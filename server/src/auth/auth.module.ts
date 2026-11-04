import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { jwtConfigFactory } from '@Config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy, LocalStrategy } from './strategies';
import { AdminModule } from '../admin';
import { OtpModule } from '../otp';
import { AccountsModule } from '../accounts';
import { PrismaModule } from '../prisma';
import { NotificationModule } from '../notification';

@Module({
  imports: [
    AdminModule,
    AccountsModule,
    PrismaModule,
    OtpModule,
    JwtModule.registerAsync({
      useFactory: (config: ConfigType<typeof jwtConfigFactory>) => ({
        secret: config.secret,
        signOptions: config.signOptions as any,
      }),
      inject: [jwtConfigFactory.KEY],
    }),
    NotificationModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {}
