import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Post } from '@shared/entites/post/post.entity';
// import { Like } from '@shared/entites/post/post-like.entity';
import { Comment } from '@shared/entites/post/post-comment.entity';
import { PostTag } from '@shared/entites/post/post-tag.entity';
import { Category } from '@shared/entites/post/post-category.entity';
import { PostController } from './apis/post.controller';
import { PostService } from './apis/post.service';

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
            // entities: [__dirname + '@shared/entites/post/*.entity.*'], // 수정
            entities: [Post, Comment, PostTag, Category],
            synchronize: true,
            logging: true,
        }),
        TypeOrmModule.forFeature([Post, Comment, PostTag, Category]),
    ],
    controllers: [PostController],
    providers: [PostService],
    exports: [PostService],
})
export class PostModule {}
