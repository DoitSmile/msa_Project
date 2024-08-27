import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PhoneAuthentication } from './checkphone';
import { JwtRefreshStrategy } from '../strategies/jwt-refresh-strategy';
import { JWtAccessStrategy } from '../strategies/jwt-access.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@shared/entites/user/user.entity';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [
    AuthService,
    PhoneAuthentication,
    JWtAccessStrategy,
    JwtRefreshStrategy,
  ],
})
export class AuthModule {}
