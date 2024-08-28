import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './apis/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { User } from '@shared/entites/user/user.entity';
@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot(), // 환경변수
    TypeOrmModule.forRoot({
      type: process.env.DATABASE_TYPE as 'mysql',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DATABASE, // env파일에서 수정
      // entities: [__dirname + '/apis/**/*.entity.*'], // 수정
      entities: [User],
      synchronize: true,
      logging: true,
    }),
  ],
})
export class AppModule {}
