import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post, Comment, Bookmark, Category } from 'entity_shared';
import { Repository, IsNull, In, ILike, Brackets } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { ImageFile } from 'src/interfaces/post-service.interface';
import { Cron, CronExpression } from '@nestjs/schedule';
import { createClient } from 'redis';

@Injectable()
export class PostService {
    private storage: Storage;
    private bucket: string;
    private readonly logger = new Logger(PostService.name);
    private redisClient: ReturnType<typeof createClient>;

    constructor(
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,
        @InjectRepository(Bookmark)
        private readonly bookmarkRepository: Repository<Bookmark>,
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
        private configService: ConfigService,
    ) {
        const projectId = this.configService.get<string>('GCP_PROJECT_ID');
        const keyFilename = this.configService.get<string>('GCP_KEY_FILENAME');

        this.storage = new Storage({
            projectId,
            keyFilename,
        });

        this.bucket = this.configService.get<string>('GCP_STORAGE_BUCKET');

        this.initRedisClient();
    }
    private async initRedisClient() {
        const redisUrl =
            this.configService.get<string>('REDIS_URL') ||
            'redis://localhost:6379';
        this.redisClient = createClient({ url: redisUrl });

        this.redisClient.on('error', (err) =>
            console.error('Redis Client Error', err),
        );

        try {
            await this.redisClient.connect();
            console.log('Connected to Redis');
        } catch (error) {
            console.error('Failed to connect to Redis', error);
        }
    }
    private removeBase64Images(content: string): string {
        return content.replace(
            /<img[^>]*src="data:image\/[^;]+;base64,[^"]*"[^>]*>/g,
            '',
        );
    }

    async uploadImages(files: ImageFile[]): Promise<string[]> {
        this.logger.debug(`Starting upload of ${files.length} images`);
        if (!files || files.length === 0) {
            this.logger.debug('No files to upload');
            return [];
        }

        const uploadPromises = files.map((file) => this.uploadImage(file));
        const results = await Promise.all(uploadPromises);
        const uploadedUrls = results.filter((url) => url !== null);
        this.logger.debug(
            `Successfully uploaded ${uploadedUrls.length} images`,
        );
        return uploadedUrls;
    }

    private async uploadImage(file: ImageFile): Promise<string | null> {
        this.logger.debug(`Uploading file: ${file.originalname}`);
        const bucket = this.storage.bucket(this.bucket);

        const fileExtension = file.originalname.split('.').pop();
        const safeFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;

        const fileUpload = bucket.file(safeFileName);

        try {
            await fileUpload.save(file.buffer, {
                metadata: {
                    contentType: file.mimetype,
                },
            });

            const publicUrl = `https://storage.googleapis.com/${this.bucket}/${safeFileName}`;
            this.logger.debug(`File uploaded successfully: ${publicUrl}`);
            return publicUrl;
        } catch (error) {
            this.logger.error(
                `File upload failed: ${error.message}`,
                error.stack,
            );
            return null;
        }
    }

    async createPost(
        createPostInput,
        userId: string,
        userName: string,
        files: ImageFile[],
    ) {
        // userName을 파라미터로 직접 받아 사용
        const { title, content, categoryId, prefix } = createPostInput;

        const imageUrls = await this.uploadImages(files);
        const cleanedContent = this.removeBase64Images(content);

        const newPost = this.postRepository.create({
            userId,
            category: categoryId,
            name: userName, // 전달받은 userName 사용
            title,
            content: cleanedContent,
            imageUrls,
            prefix,
        });

        const savedPost = await this.postRepository.save(newPost);
        return savedPost;
    }

    async updatePost(postId, updatePostInput, files: ImageFile[]) {
        this.logger.debug(
            `Updating post ${postId} with ${files.length} images`,
        );
        const { title, content, prefix } = updatePostInput;
        const post = await this.postRepository.findOne({
            where: { id: postId },
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        const imageUrls = await this.uploadImages(files);
        const cleanedContent = this.removeBase64Images(content);

        post.title = title;
        post.content = cleanedContent;
        post.imageUrls = imageUrls;
        post.prefix = prefix;

        const updatedPost = await this.postRepository.save(post);
        this.logger.debug(
            `Post updated with ID: ${updatedPost.id}, Image URLs: ${updatedPost.imageUrls}`,
        );
        return updatedPost;
    }

    async deletePosts(postId) {
        const post = await this.postRepository.findOne({
            where: { id: postId },
            relations: ['comment', 'bookmarks'],
        });

        if (!post) {
            throw new NotFoundException(`Post with ID ${postId} not found`);
        }

        return await this.postRepository.softRemove(post);
    }

    async fetchPosts(page: number = 1, pageSize: number = 20) {
        const [posts, total] = await this.postRepository.findAndCount({
            order: { createdAt: 'DESC' },
            take: pageSize,
            skip: (page - 1) * pageSize,
            relations: ['category', 'comment', 'bookmarks'],
        });

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

    async fetchCategoryPosts(
        categoryId: string,
        page: number = 1,
        pageSize: number = 20,
    ) {
        const [posts, total] = await this.postRepository.findAndCount({
            where: { category: { id: categoryId } },
            order: { createdAt: 'DESC' },
            take: pageSize,
            skip: (page - 1) * pageSize,
            relations: ['category', 'comment'],
        });

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

    async getPopularPosts(page: number = 1, pageSize: number = 20) {
        const [posts, total] = await this.postRepository.findAndCount({
            order: { views: 'DESC' },
            take: pageSize,
            skip: (page - 1) * pageSize,
            relations: ['category', 'comment'],
        });

        return {
            posts,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }

    async fetchMyPost(userId: string, page: number = 1, pageSize: number = 10) {
        const [posts, total] = await this.postRepository.findAndCount({
            where: { userId: userId },
            order: { createdAt: 'DESC' },
            relations: ['category', 'comment'],
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        for (const post of posts) {
            const cacheKey = `post:${post.id}:views`;
            const cachedViews = await this.cacheManager.get<number>(cacheKey);
            post.views = cachedViews || post.views;
            post.name;
        }

        return {
            posts,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async resetBestPosts() {
        await this.redisClient.del('best_posts');
        this.logger.log('Best posts ranking has been reset');
    }
    async incrementPostView(postId: string, userId: string) {
        const postViewKey = `post:${postId}:views`;
        const userViewCacheKey = `post:${postId}:user:${userId}:view`;
        const bestPostsKey = 'best_posts';

        const multi = this.redisClient.multi();

        multi.incr(postViewKey);
        multi.zIncrBy(bestPostsKey, 1, postId);
        multi.set(userViewCacheKey, 'true', { EX: 300 });

        await multi.exec();

        const viewsStr = await this.redisClient.get(postViewKey);
        const views = viewsStr ? parseInt(viewsStr) : 0;

        // 데이터베이스 업데이트 (비동기로 처리)
        this.postRepository.update(postId, { views }).catch((err) => {
            this.logger.error(
                `Failed to update views in database: ${err.message}`,
            );
        });

        return views;
    }
    async fetchPost(postId: string, currentUserId: string) {
        const post = await this.postRepository.findOne({
            where: { id: postId },
            relations: ['category', 'comment'],
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        // Redis에서 현재 조회수 확인
        const postViewKey = `post:${postId}:views`;
        const cachedViews = await this.redisClient.get(postViewKey);
        post.views = cachedViews ? parseInt(cachedViews) : post.views;

        // 조회수 증가 처리
        const views = await this.incrementPostView(postId, currentUserId);
        post.views = views;

        const bookmark = await this.bookmarkRepository.findOne({
            where: { userId: currentUserId, post: { id: postId } },
        });
        const bookmarkCount = await this.bookmarkRepository.count({
            where: { post: { id: postId } },
        });

        // 댓글 수를 계산
        const commentCount = await this.commentRepository.count({
            where: {
                post: { id: postId },
                deletedAt: IsNull(),
            },
        });
        console.log('댓글 수 : ', commentCount);
        return {
            ...post,
            isBookmarked: !!bookmark,
            bookmarkCount,
            commentCount,
        };
    }

    // 댓글 생성
    async createComment(createCommentInput, userId: string, userName: string) {
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
            if (!parent) {
                throw new NotFoundException('Parent comment not found');
            }
        }

        const comment = this.commentRepository.create({
            content,
            username: userName,
            userId,
            post,
            parent,
        });

        await this.commentRepository.save(comment);

        // 댓글 수를 계산
        const commentCount = await this.commentRepository.count({
            where: {
                post: { id: postId },
                deletedAt: IsNull(),
            },
        });

        // 댓글과 댓글 수를 함께 반환
        return {
            comment,
            commentCount,
        };
    }
    async fetchComment(
        postId: string,
    ): Promise<{ comments: Comment[]; total: number }> {
        const [comments, total] = await this.commentRepository.findAndCount({
            where: {
                post: { id: postId },
                parentId: IsNull(),
            },
            relations: ['replies', 'replies.replies'],
            order: { createdAt: 'DESC' },
        });

        return {
            comments,
            total,
        };
    }

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

    async updateComment(commentId, content) {
        return this.commentRepository.update({ id: commentId }, { content });
    }

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

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async cleanupOldData() {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        const oldKey = `popular_posts:${date.toISOString().split('T')[0]}`;
        await this.redisClient.del(oldKey);
    }

    @Cron(CronExpression.EVERY_10_MINUTES)
    async syncViewsToDatabase() {
        const posts = await this.postRepository.find();
        for (const post of posts) {
            const cacheKey = `post:${post.id}:views`;
            const cachedViews = await this.redisClient.get(cacheKey);
            if (cachedViews) {
                const views = parseInt(cachedViews);
                if (views !== post.views) {
                    await this.postRepository.update(post.id, { views });
                    await this.redisClient.set(cacheKey, views.toString());
                }
            }
        }
    }

    async searchPosts(
        query: string,
        page: number = 1,
        pageSize: number = 10,
        sort: string = 'date',
    ) {
        console.log('Executing search with params:', {
            query,
            page,
            pageSize,
            sort,
        });

        try {
            let queryBuilder = this.postRepository
                .createQueryBuilder('post')
                .select([
                    'post.id',
                    'post.title',
                    'post.content',
                    'post.name',
                    'post.views',
                    'post.createdAt',
                    'post.imageUrls',
                ])
                .where(
                    new Brackets((qb) => {
                        qb.where('LOWER(post.title) LIKE LOWER(:query)', {
                            query: `%${query}%`,
                        }).orWhere('LOWER(post.content) LIKE LOWER(:query)', {
                            query: `%${query}%`,
                        });
                    }),
                )
                .andWhere('post.deletedAt IS NULL');

            // 댓글 수 서브쿼리
            const commentCountSubQuery = this.commentRepository
                .createQueryBuilder('comment')
                .select('COUNT(DISTINCT comment.id)', 'commentCount')
                .where('comment.postId = post.id')
                .andWhere('comment.deletedAt IS NULL');

            switch (sort) {
                case 'comments':
                    queryBuilder = queryBuilder
                        .addSelect(
                            `(${commentCountSubQuery.getQuery()})`,
                            'commentCount',
                        )
                        .orderBy('commentCount', 'DESC')
                        .addOrderBy('post.createdAt', 'DESC')
                        .setParameters(commentCountSubQuery.getParameters());
                    break;
                case 'views':
                    queryBuilder = queryBuilder
                        .orderBy('post.views', 'DESC')
                        .addOrderBy('post.createdAt', 'DESC');
                    break;
                default:
                    queryBuilder = queryBuilder.orderBy(
                        'post.createdAt',
                        'DESC',
                    );
            }

            const [posts, total] = await queryBuilder
                .offset((page - 1) * pageSize)
                .limit(pageSize)
                .getManyAndCount();

            const postsWithComments = await Promise.all(
                posts.map(async (post) => {
                    const commentCount = await this.commentRepository.count({
                        where: {
                            post: { id: post.id },
                            deletedAt: IsNull(),
                        },
                    });

                    return {
                        ...post,
                        commentCount,
                        title: this.highlightText(post.title, query),
                        content: this.highlightText(post.content, query),
                    };
                }),
            );

            return {
                posts: postsWithComments,
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            };
        } catch (error) {
            this.logger.error(`Search failed: ${error.message}`);
            throw error;
        }
    }
    // 캐시 래퍼 메서드 추가
    async searchPostsWithCache(
        query: string,
        page: number = 1,
        pageSize: number = 10,
        sort: string = 'date',
    ) {
        const cacheKey = `search:${query}:${sort}:${page}:${pageSize}`;

        try {
            // 캐시 확인
            const cachedResult = await this.redisClient.get(cacheKey);
            if (cachedResult) {
                return JSON.parse(cachedResult);
            }

            // DB 검색 실행
            const result = await this.searchPosts(query, page, pageSize, sort);

            // 결과 캐싱
            await this.redisClient.set(cacheKey, JSON.stringify(result), {
                EX: 300, // 5분 캐시
            });

            return result;
        } catch (error) {
            this.logger.error(`Cache operation failed: ${error.message}`);
            // 캐시 실패 시 직접 검색 결과 반환
            return this.searchPosts(query, page, pageSize, sort);
        }
    }
    /**
     * 텍스트에서 검색어를 하이라이트하는 메서드
     * @param text 원본 텍스트
     * @param query 검색어
     * @returns 검색어가 하이라이트된 텍스트
     */
    private highlightText(text: string, query: string): string {
        // 모든 따옴표 제거 및 처리
        const cleanQuery = query.replace(/['"]+/g, '').trim();
        const escapedQuery = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        console.log('Clean query:', cleanQuery, 'Escaped query:', escapedQuery); // 디버깅용
        const regex = new RegExp(escapedQuery, 'g');
        return text.replace(regex, (match) => `<mark>${match}</mark>`);
    }
    async createBookmark(
        userId: string,
        postId: string,
    ): Promise<{ isBookmarked: boolean; bookmarkCount: number }> {
        const post = await this.postRepository.findOne({
            where: { id: postId },
        });
        if (!post) {
            throw new NotFoundException('Post not found');
        }

        let bookmark = await this.bookmarkRepository.findOne({
            where: { userId, post: { id: postId } },
        });

        if (bookmark) {
            // 이미 북마크가 존재하면 삭제 (토글 기능)
            await this.bookmarkRepository.remove(bookmark);
            const bookmarkCount = await this.bookmarkRepository.count({
                where: { post: { id: postId } },
            });
            return { isBookmarked: false, bookmarkCount };
        } else {
            // 북마크가 없으면 생성
            bookmark = this.bookmarkRepository.create({ userId, post });
            await this.bookmarkRepository.save(bookmark);
            const bookmarkCount = await this.bookmarkRepository.count({
                where: { post: { id: postId } },
            });
            return { isBookmarked: true, bookmarkCount };
        }
    }

    async deleteBookmark(userId: string, postId: string) {
        const bookmark = await this.bookmarkRepository.findOne({
            where: { userId, post: { id: postId } },
        });

        if (!bookmark) {
            throw new NotFoundException('Bookmark not found');
        }

        await this.bookmarkRepository.softRemove(bookmark);
        return { success: true };
    }

    async getUserBookmarks(
        userId: string,
        page: number = 1,
        pageSize: number = 10,
    ) {
        const [bookmarks, total] = await this.bookmarkRepository.findAndCount({
            where: { userId },
            relations: ['post'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        return {
            bookmarks,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }

    async isPostBookmarked(userId: string, postId: string) {
        const bookmark = await this.bookmarkRepository.findOne({
            where: { userId, post: { id: postId } },
        });

        return { isBookmarked: !!bookmark };
    }

    async getCategories() {
        try {
            console.log('카테고리 조회 시작');
            const categories = await this.categoryRepository.find();
            console.log('조회된 카테고리:', categories);
            return categories;
        } catch (error) {
            console.error('카테고리 조회 실패:', error);
            throw error;
        }
    }
}
