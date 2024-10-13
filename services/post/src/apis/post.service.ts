import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '@shared/entites/post/post.entity';
import { Comment } from '@shared/entites/post/post-comment.entity';
import { IsNull, Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { ImageFile } from 'src/interfaces/post-service.interface';

@Injectable()
export class PostService {
    private storage: Storage;
    private bucket: string;
    private readonly logger = new Logger(PostService.name);

    constructor(
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
        private configService: ConfigService,
    ) {
        // 환경 변수에서 GCP 프로젝트 ID와 키 파일 경로를 가져옵니다.
        const projectId = this.configService.get<string>('GCP_PROJECT_ID');
        const keyFilename = this.configService.get<string>('GCP_KEY_FILENAME');

        // Storage 인스턴스를 생성합니다.
        this.storage = new Storage({
            projectId,
            keyFilename,
        });

        // 버킷 이름을 환경 변수에서 가져옵니다.
        this.bucket = this.configService.get<string>('GCP_STORAGE_BUCKET');
    }

    // 이미지 업로드 처리
    async uploadImage(file: ImageFile): Promise<{ url: string }> {
        this.logger.log(`Uploading file: ${file.originalname}`);
        const bucket = this.storage.bucket(this.bucket);
        const fileName = `${Date.now()}-${file.originalname}`;
        const fileUpload = bucket.file(fileName);

        try {
            await fileUpload.save(file.buffer, {
                metadata: {
                    contentType: file.mimetype,
                },
            });

            const publicUrl = `https://storage.googleapis.com/${this.bucket}/${fileName}`;
            this.logger.log(`File uploaded successfully: ${publicUrl}`);
            return { url: publicUrl };
        } catch (error) {
            this.logger.error(
                `File upload failed: ${error.message}`,
                error.stack,
            );
            throw new Error('파일 업로드에 실패했습니다.');
        }
    }

    // 게시물 생성
    async createPost(createPostInput, name, userId, imageUrl?: string) {
        const { title, content, categoryId } = createPostInput;

        // content에서 base64 이미지 데이터 제거
        const cleanedContent = this.removeBase64Images(content);

        const newPost = this.postRepository.create({
            userId,
            category: categoryId,
            name,
            title,
            content: cleanedContent,
            imageUrl,
        });

        return await this.postRepository.save(newPost);
    }

    // 게시글 수정
    async updatePost(postId, updatePostInput, imageUrl?: string) {
        const { title, content } = updatePostInput;
        const post = await this.postRepository.findOne({
            where: { id: postId },
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        // content에서 base64 이미지 데이터 제거
        const cleanedContent = this.removeBase64Images(content);

        post.title = title;
        post.content = cleanedContent;
        if (imageUrl) {
            post.imageUrl = imageUrl;
        }

        return await this.postRepository.save(post);
    }

    // base64 이미지 데이터 제거 함수
    private removeBase64Images(content: string): string {
        return content.replace(
            /<img[^>]*src="data:image\/[^;]+;base64,[^"]*"[^>]*>/g,
            '',
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
    async fetchPost(postId: string, currentUserId: string) {
        const post = await this.postRepository.findOne({
            where: { id: postId },
            relations: ['category'],
        });
        console.log('post.userId:', post.userId);
        console.log('currentUserId:', currentUserId);
        if (!post) {
            throw new NotFoundException('Post not found');
        }

        console.log('post.views:', post.views);
        const cacheKey = `post:${postId}:views`;
        let views = post.views;

        // 현재 사용자가 게시글 작성자가 아니고, 최근에 조회하지 않았을 경우에만 조회수 증가
        if (post.userId !== currentUserId) {
            const userViewCacheKey = `post:${postId}:user:${currentUserId}:view`;
            const userViewed = await this.cacheManager.get(userViewCacheKey);

            if (!userViewed) {
                console.log('조회수증가');
                views++;
                await this.cacheManager.set(cacheKey, views, 3600000); // 1시간 캐시
                await this.cacheManager.set(userViewCacheKey, true, 300000); // 5분 동안 중복 조회 방지

                // 데이터베이스 업데이트
                await this.postRepository.update(postId, { views });
            }
        }

        // 이미지 URL 처리
        if (post.imageUrl) {
            post.content = post.content.replace(
                /<img[^>]*src="[^"]*"[^>]*>/g,
                `<img src="${post.imageUrl}" alt="Post Image" />`,
            );
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
            console.log('Cached views:', cachedViews);
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
