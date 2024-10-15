import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '@shared/entites/post/post.entity';
import { Comment } from '@shared/entites/post/post-comment.entity';
import { IsNull, Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
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
        const projectId = this.configService.get<string>('GCP_PROJECT_ID');
        const keyFilename = this.configService.get<string>('GCP_KEY_FILENAME');

        this.storage = new Storage({
            projectId,
            keyFilename,
        });

        this.bucket = this.configService.get<string>('GCP_STORAGE_BUCKET');
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

    async createPost(createPostInput, name, userId, files: ImageFile[]) {
        this.logger.debug(`Creating post with ${files.length} images`);
        const { title, content, categoryId } = createPostInput;

        const imageUrls = await this.uploadImages(files);
        const cleanedContent = this.removeBase64Images(content);

        const newPost = this.postRepository.create({
            userId,
            category: categoryId,
            name,
            title,
            content: cleanedContent,
            imageUrls,
        });

        const savedPost = await this.postRepository.save(newPost);
        this.logger.debug(
            `Post created with ID: ${savedPost.id}, Image URLs: ${savedPost.imageUrls}`,
        );
        return savedPost;
    }

    async updatePost(postId, updatePostInput, files: ImageFile[]) {
        this.logger.debug(
            `Updating post ${postId} with ${files.length} images`,
        );
        const { title, content } = updatePostInput;
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

        const updatedPost = await this.postRepository.save(post);
        this.logger.debug(
            `Post updated with ID: ${updatedPost.id}, Image URLs: ${updatedPost.imageUrls}`,
        );
        return updatedPost;
    }

    async deletePosts(postId) {
        const post = await this.postRepository.findOne({
            where: { id: postId },
            relations: ['comment'],
        });

        if (!post) {
            throw new NotFoundException(`Post with ID ${postId} not found`);
        }

        return await this.postRepository.softRemove(post);
    }
    async fetchPosts() {
        const posts = await this.postRepository.find({
            order: { createdAt: 'DESC' },
            take: 100,
            relations: ['category'],
        });

        for (const post of posts) {
            const cacheKey = `post:${post.id}:views`;
            const cachedViews = await this.cacheManager.get<number>(cacheKey);
            post.views = cachedViews || post.views;
        }

        return posts;
    }

    async fetchCategoryPosts(categoryId) {
        const posts = await this.postRepository.find({
            where: { category: { id: categoryId } },
            order: { createdAt: 'DESC' },
            take: 100,
            relations: ['category'],
        });

        for (const post of posts) {
            const cacheKey = `post:${post.id}:views`;
            const cachedViews = await this.cacheManager.get<number>(cacheKey);
            post.views = cachedViews || post.views;
        }

        return posts;
    }

    async fetchMyPost(userId: string, page: number = 1, pageSize: number = 10) {
        const [posts, total] = await this.postRepository.findAndCount({
            where: { userId: userId },
            order: { createdAt: 'DESC' },
            relations: ['category'],
            skip: (page - 1) * pageSize,
            take: pageSize,
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

    async fetchPost(postId: string, currentUserId: string) {
        const post = await this.postRepository.findOne({
            where: { id: postId },
            relations: ['category'],
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        const cacheKey = `post:${postId}:views`;
        let views = post.views;

        if (post.userId !== currentUserId) {
            const userViewCacheKey = `post:${postId}:user:${currentUserId}:view`;
            const userViewed = await this.cacheManager.get(userViewCacheKey);

            if (!userViewed) {
                views++;
                await this.cacheManager.set(cacheKey, views, 3600000);
                await this.cacheManager.set(userViewCacheKey, true, 300000);
                await this.postRepository.update(postId, { views });
            }
        }

        return { ...post, views };
    }

    async getPostViews(postId: string) {
        const cacheKey = `post:${postId}:views`;
        let views = await this.cacheManager.get<number>(cacheKey);

        if (views === undefined) {
            const post = await this.postRepository.findOne({
                where: { id: postId },
                select: ['views'],
            });
            views = post?.views || 0;
            await this.cacheManager.set(cacheKey, views, 3600000);
        }

        return { postId, views };
    }

    async getPopularPosts(limit: number = 10) {
        return this.postRepository.find({
            order: { views: 'DESC' },
            take: limit,
            relations: ['category'],
        });
    }

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

    async fetchComment(postId): Promise<Comment[]> {
        return this.commentRepository.find({
            where: { post: { id: postId }, parentId: IsNull() },
            relations: ['replies', 'replies.replies'],
            order: { createdAt: 'DESC' },
        });
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

    async searchPosts(query: string, page: number = 1, pageSize: number = 10) {
        const queryBuilder = this.postRepository
            .createQueryBuilder('post')
            .leftJoinAndSelect('post.category', 'category')
            .leftJoinAndSelect('post.comment', 'comment')
            .where('post.title LIKE :query OR post.content LIKE :query', {
                query: `%${query}%`,
            })
            .select([
                'post.id',
                'post.title',
                'post.content',
                'post.name',
                'post.createdAt',
                'post.views',
                'category.name',
                'COUNT(DISTINCT comment.id) AS commentCount',
            ])
            .groupBy('post.id')
            .orderBy('post.createdAt', 'DESC');

        const [posts, total] = await queryBuilder
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .getManyAndCount();

        // Redis 캐시에서 조회수 가져오기 및 검색어 하이라이트
        const highlightedPosts = await Promise.all(
            posts.map(async (post) => {
                const cacheKey = `post:${post.id}:views`;
                const cachedViews =
                    await this.cacheManager.get<number>(cacheKey);
                post.views = cachedViews || post.views;

                // 제목과 내용에서 검색어 하이라이트
                post.title = this.highlightText(post.title, query);
                post.content = this.highlightText(post.content, query);

                return post;
            }),
        );

        const totalPages = Math.ceil(total / pageSize);

        return {
            posts: highlightedPosts,
            total,
            page,
            pageSize,
            totalPages,
        };
    }

    /**
     * 텍스트에서 검색어를 하이라이트하는 메서드
     * @param text 원본 텍스트
     * @param query 검색어
     * @returns 검색어가 하이라이트된 텍스트
     */
    private highlightText(text: string, query: string): string {
        const regex = new RegExp(query, 'gi');
        return text.replace(regex, (match) => `<mark>${match}</mark>`);
    }
}
