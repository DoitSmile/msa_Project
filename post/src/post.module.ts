import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Post } from '@shared/entites/post/post.entity';
import { User } from '@shared/entites/user/user.entity';
import { PostController } from './apis/post.controller';
import { PostService } from './apis/post.service';
// import { Category } from '@shared/entites/category/category.entity';
// import { Board } from '@shared/entites/board/board.entity';
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
            entities: [Post],
            synchronize: true,
            logging: true,
        }),
        TypeOrmModule.forFeature([Post]),
    ],
    controllers: [PostController],
    providers: [PostService],
    exports: [PostService],
})
export class PostModule {}
