import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from '@shared/entites/user/user.entity';
import { AuthController } from './apis/auth.controller';
import { AuthService } from './apis/auth.service';
import { PhoneAuthentication } from './apis/checkphone';
import { JWtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh-strategy';
import { RedisClientOptions } from 'redis'; // 추가
import * as redisStore from 'cache-manager-redis-store'; // 추가

@Module({
  imports: [
    ConfigModule.forRoot(), // 환경변수
    JwtModule.register({}),
    TypeOrmModule.forRoot({
      //forRoot()로 데이터베이스 연결 설정과 엔티티 등록을 한 번에 함
      //forFeature()는 주로 여러 모듈에서 특정 엔티티만 선택적으로 사용할 때 유용
      type: process.env.DATABASE_TYPE as 'mysql',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DATABASE, // env파일에서 수정
      // entities: [__dirname + '/apis/**/*.entity.*'], // 수정
      entities: [__dirname + './shared/entites/user/*.entity.*'], //동적 import 사용
      synchronize: true,
      logging: true,
    }),
    CacheModule.register<RedisClientOptions>({
      // 추가
      store: redisStore,
      url: 'redis://my-auth-redis:6379',
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PhoneAuthentication,
    JWtAccessStrategy,
    JwtRefreshStrategy,
  ],
})
export class AuthModule {}
