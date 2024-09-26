import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from '@shared/entites/user/user.entity';
import { Like } from '@shared/entites/post/post-like.entity';
import { UserController } from './apis/user/user.controller';
import { UserService } from './apis/user/user.service';

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
      // entities: [__dirname + '/apis/**/*.entity.*'], // 수정
      entities: [User,Like],
      synchronize: true,
      logging: true,
    }),
    TypeOrmModule.forFeature([User,Like]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
