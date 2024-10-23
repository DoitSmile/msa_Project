import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from 'entity_shared';
import { UserController } from './apis/user/user.controller';
import { UserService } from './apis/user/user.service';
import { PhoneAuthentication } from './apis/user/checkphone';

@Module({
  imports: [
    ConfigModule.forRoot(), // 환경변수
    TypeOrmModule.forRoot({
      type: process.env.DATABASE_TYPE as 'mysql',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DATABASE, // env파일에서 수정
      // entities: [__dirname + '@shared/entites/user/*.entity.*'],
      entities: [User],
      synchronize: true,
      logging: true,
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserController],
  providers: [UserService, PhoneAuthentication],
  exports: [UserService],
})
export class UserModule {}
