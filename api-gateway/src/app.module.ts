// app.module.ts

import { Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JWtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh-strategy';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controller/auth.controller';
import { PostController } from './controller/post.controller';
import { UserDataService } from './service/user-data.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      // ttl: 5 * 60,
    }),
    JwtModule.register({}),
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: { host: 'auth-service', port: 3001 }, // 게이트웨이와 서비스를 똑같이 입력
      },

      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: { host: 'user-service', port: 3002 }, // 게이트웨이와 서비스를 똑같이 입력
      },

      {
        name: 'POST_SERVICE',
        transport: Transport.TCP,
        options: { host: 'post-service', port: 3003 }, // 게이트웨이와 서비스를 똑같이 입력
      },
    ]),
  ],
  controllers: [UserController, AuthController, PostController],
  providers: [
    AppService,
    JWtAccessStrategy,
    JwtRefreshStrategy,
    UserDataService,
  ],
})
export class AppModule {}
