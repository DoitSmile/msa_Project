// post.module.ts
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Post } from 'entity_shared';
import { Comment } from 'entity_shared';
import { PostTag } from 'entity_shared';
import { Category } from 'entity_shared';
import { Bookmark } from 'entity_shared';
import { PostController } from './apis/post.controller';
import { PostService } from './apis/post.service';
import * as redisStore from 'cache-manager-redis-store';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
            type: process.env.DATABASE_TYPE as 'mysql',
            host: process.env.DATABASE_HOST,
            port: Number(process.env.DATABASE_PORT),
            username: process.env.DATABASE_USERNAME,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_DATABASE,
            entities: [Post, Comment, PostTag, Category, Bookmark],
            synchronize: true,
            logging: true,
        }),
        TypeOrmModule.forFeature([Post, Comment, PostTag, Category, Bookmark]),
        CacheModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                store: redisStore,
                url: configService.get<string>(
                    'REDIS_URL',
                    'redis://my-auth-redis:6379',
                ),
                ttl: 60 * 60, // 1 hour default TTL
                isGlobal: true,
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [PostController],
    providers: [PostService],
    exports: [PostService],
})
export class PostModule {}
