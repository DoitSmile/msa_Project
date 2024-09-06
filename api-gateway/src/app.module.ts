// app.module.ts

import { Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JWtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh-strategy';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controller/auth.controller';
import { BoardController } from './controller/board.controller';

@Module({
  imports: [
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
        name: 'BOARD_SERVICE',
        transport: Transport.TCP,
        options: { host: 'board-service', port: 3003 }, // 게이트웨이와 서비스를 똑같이 입력
      },
    ]),
  ],
  controllers: [UserController, AuthController, BoardController],
  providers: [AppService, JWtAccessStrategy, JwtRefreshStrategy],
})
export class AppModule {}
