import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '@shared/entites/post/post.entity';
import { Comment } from '@shared/entites/post/post-comment.entity';
import { IsNull, Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class PostService {
    constructor(
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
    ) {}

    // 게시물 생성
    async createPost(createPostInput, name, userId) {
        console.log('createPostInput:', createPostInput);
        const { title, content, categoryId } = createPostInput;

        return await this.postRepository.save({
            userId,
            category: categoryId,
            name,
            title,
            content,
            relations: ['category'],
        });
    }

    // 게시글 수정
    async updatePost(postId, updatePostInput) {
        console.log('updatePostInput:', updatePostInput);
        const { title, content } = updatePostInput;
        return await this.postRepository.update(
            { id: postId },
            { title, content },
        );
    }

    // 게시글 삭제
    async deletePosts(postId) {
        return await this.postRepository.softRemove({ id: postId });
    }

    // 전체 게시글 보기 (최신순)
    async fetchPosts() {
        const posts = await this.postRepository.find({
            order: { createdAt: 'DESC' },
            take: 100,
            relations: ['category'],
        });

        // Redis에서 각 게시물의 조회수를 가져와 업데이트
        for (const post of posts) {
            const cacheKey = `post:${post.id}:views`;
            const cachedViews = await this.cacheManager.get<number>(cacheKey);
            post.views = cachedViews || post.views;
        }

        return posts;
    }

    // 카테고리별 게시글 보기
    async fetchCategoryPosts(categoryId) {
        console.log('최종:', categoryId);
        const posts = await this.postRepository.find({
            where: { category: { id: categoryId } },
            order: { createdAt: 'DESC' },
            take: 100,
            relations: ['category'],
        });

        // Redis에서 각 게시물의 조회수를 가져와 업데이트
        for (const post of posts) {
            const cacheKey = `post:${post.id}:views`;
            const cachedViews = await this.cacheManager.get<number>(cacheKey);
            post.views = cachedViews || post.views;
        }

        return posts;
    }

    // 내 게시글 보기
    async fetchMyPost(userId: string, page: number = 1, pageSize: number = 10) {
        const [posts, total] = await this.postRepository.findAndCount({
            where: { userId: userId },
            order: { createdAt: 'DESC' },
            relations: ['category'],
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        // Redis에서 각 게시물의 조회수를 가져와 업데이트
        for (const post of posts) {
            const cacheKey = `post:${post.id}:views`;
            const cachedViews = await this.cacheManager.get<number>(cacheKey);
            post.views = cachedViews || post.views;
        }

        return {
            posts,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }

    // 특정 게시글 보기 (조회수 증가 포함)
    async fetchPost(postId: string) {
        console.log('postId:', postId);

        const cacheKey = `post:${postId}:views`;
        let views = (await this.cacheManager.get<number>(cacheKey)) || 0;
        views++;
        await this.cacheManager.set(cacheKey, views, 3600000); // 1시간 캐시

        const post = await this.postRepository.findOne({
            where: { id: postId },
            relations: ['category'],
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        // 일정 주기로 데이터베이스에 조회수 동기화 (예: 10회 조회마다)
        if (views % 10 === 0) {
            await this.postRepository.update(postId, { views });
        }

        return { ...post, views };
    }

    // 조회수 조회
    async getPostViews(postId: string) {
        const cacheKey = `post:${postId}:views`;
        let views = await this.cacheManager.get<number>(cacheKey);

        if (views === undefined) {
            const post = await this.postRepository.findOne({
                where: { id: postId },
                select: ['views'],
            });
            views = post?.views || 0;
            await this.cacheManager.set(cacheKey, views, 3600000); // 1시간 캐시
        }

        return { postId, views };
    }

    // 인기 게시물 조회
    async getPopularPosts(limit: number = 10) {
        return this.postRepository.find({
            order: { views: 'DESC' },
            take: limit,
            relations: ['category'],
        });
    }

    // 댓글 생성
    async createComment(createCommentInput, username, userId) {
        const { postId, parentId, content } = createCommentInput;

        const post = await this.postRepository.findOne({
            where: { id: postId },
        });

        if (!post) {
            throw new NotFoundException('글이 없습니다.');
        }

        let parent: Comment | null = null;
        if (parentId) {
            parent = await this.commentRepository.findOne({
                where: { id: parentId },
            });
            console.log('parent:', parent);
            if (!parent) {
                throw new NotFoundException('Parent comment not found');
            }
        }

        const comment = this.commentRepository.create({
            content,
            username,
            userId,
            post,
            parent,
        });

        return this.commentRepository.save(comment);
    }

    // 댓글 조회
    async fetchComment(postId): Promise<Comment[]> {
        console.log('postId:', postId);
        return this.commentRepository.find({
            where: { post: { id: postId }, parentId: IsNull() },
            relations: ['replies', 'replies.replies'],
            order: { createdAt: 'DESC' },
        });
    }

    // 댓글 조회 (유저별)
    async fetchUserComments(
        userId: string,
        page: number = 1,
        pageSize: number = 10,
    ) {
        const [comments, total] = await this.commentRepository.findAndCount({
            where: { userId: userId },
            order: { createdAt: 'DESC' },
            relations: ['post'],
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        return {
            comments,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }

    // 댓글 수정
    async updateComment(commentId, content) {
        console.log('content:', content);
        return this.commentRepository.update({ id: commentId }, { content });
    }

    // 댓글 삭제
    async deleteComment(commentId) {
        const comment = await this.commentRepository.findOne({
            where: { id: commentId },
            relations: ['replies'],
        });

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        const deletedReplies = await Promise.all(
            comment.replies.map((reply) =>
                this.commentRepository.softRemove(reply),
            ),
        );
        const deletedComment = await this.commentRepository.softRemove(comment);

        return { deletedComment, deletedReplies };
    }

    // Redis의 조회수를 데이터베이스에 동기화
    async syncViewsToDatabase() {
        const posts = await this.postRepository.find();
        for (const post of posts) {
            const cacheKey = `post:${post.id}:views`;
            const cachedViews = await this.cacheManager.get<number>(cacheKey);
            if (cachedViews !== undefined && cachedViews !== post.views) {
                await this.postRepository.update(post.id, {
                    views: cachedViews,
                });
            }
        }
    }

    // 매 시간마다 조회수 동기화
    @Cron(CronExpression.EVERY_HOUR)
    async handleViewsSynchronization() {
        console.log('Synchronizing views to database...');
        await this.syncViewsToDatabase();
    }

    // // 매일 자정에 인기 게시물 집계
    // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    // async aggregatePopularPosts() {
    //     console.log('Aggregating popular posts...');
    //     const popularPosts = await this.getPopularPosts(10);
    //     // 여기서 집계된 인기 게시물을 처리할 수 있습니다.
    //     // 예: 데이터베이스에 저장, 캐시에 저장, 알림 발송 등
    // }

    // // 매주 일요일 새벽 3시에 오래된 게시물 아카이브
    // @Cron('0 3 * * 0')
    // async archiveOldPosts() {
    //     console.log('Archiving old posts...');
    //     const oneMonthAgo = new Date();
    //     oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    //     const oldPosts = await this.postRepository.find({
    //         where: {
    //             createdAt: IsNull(oneMonthAgo),
    //         },
    //     });

    //     // 여기서 오래된 게시물을 아카이브하거나 처리할 수 있습니다.
    //     // 예: 별도의 테이블로 이동, 상태 변경 등
    // }
}
