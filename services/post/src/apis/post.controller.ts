import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PostService } from './post.service';
import { ImageFile } from 'src/interfaces/post-service.interface';

@Controller()
export class PostController {
    constructor(private readonly postService: PostService) {}

    @MessagePattern({ cmd: 'createPost' })
    async createPost(data) {
        const { createPostInput, name, userId, files } = data;
        const imageFiles: ImageFile[] = files
            ? files.map((file) => ({
                  originalname: file.originalname,
                  mimetype: file.mimetype,
                  buffer: Buffer.from(file.buffer, 'base64'),
              }))
            : [];
        return await this.postService.createPost(
            createPostInput,
            name,
            userId,
            imageFiles,
        );
    }

    @MessagePattern({ cmd: 'updatePost' })
    async updatePost(data) {
        const { postId, updatePostInput, files } = data;
        const imageFiles: ImageFile[] = files
            ? files.map((file) => ({
                  originalname: file.originalname,
                  mimetype: file.mimetype,
                  buffer: Buffer.from(file.buffer, 'base64'),
              }))
            : [];
        return await this.postService.updatePost(
            postId,
            updatePostInput,
            imageFiles,
        );
    }

    @MessagePattern({ cmd: 'deletePost' })
    async deletePosts(data) {
        return await this.postService.deletePosts(data.postId);
    }

    @MessagePattern({ cmd: 'fetchMyPost' })
    async fetchMyPost(data) {
        return await this.postService.fetchMyPost(
            data.userId,
            data.page,
            data.pageSize,
        );
    }

    @MessagePattern({ cmd: 'fetchPost' })
    async fetchPost(data) {
        return await this.postService.fetchPost(data.postId, data.userId);
    }

    @MessagePattern({ cmd: 'fetchPosts' })
    async fetchPosts() {
        return await this.postService.fetchPosts();
    }

    @MessagePattern({ cmd: 'fetchCategoryPosts' })
    async fetchCategoryPosts(data: { categoryId: string }) {
        return await this.postService.fetchCategoryPosts(data.categoryId);
    }

    @MessagePattern({ cmd: 'createComment' })
    async createComment(data) {
        return await this.postService.createComment(
            data.createCommentInput,
            data.username,
            data.userId,
        );
    }

    @MessagePattern({ cmd: 'fetchComment' })
    async fetchComment(data) {
        return await this.postService.fetchComment(data.postId);
    }

    @MessagePattern({ cmd: 'fetchUserComments' })
    async fetchUserComments(data) {
        return await this.postService.fetchUserComments(
            data.userId,
            data.page,
            data.pageSize,
        );
    }

    @MessagePattern({ cmd: 'updateComment' })
    async updateComment(data) {
        return await this.postService.updateComment(
            data.commentId,
            data.content,
        );
    }

    @MessagePattern({ cmd: 'deleteComment' })
    async deleteComment(data) {
        return await this.postService.deleteComment(data.commentId);
    }

    @MessagePattern({ cmd: 'getPopularPosts' })
    async getPopularPosts(data: { limit?: number }) {
        return await this.postService.getPopularPosts(data.limit);
    }

    @MessagePattern({ cmd: 'searchPosts' })
    async searchPosts(data: { query: string; page: number; pageSize: number }) {
        return await this.postService.searchPosts(
            data.query,
            data.page,
            data.pageSize,
        );
    }

    @MessagePattern({ cmd: 'createBookmark' })
    async createBookmark(data: { userId: string; postId: string }) {
        return await this.postService.createBookmark(data.userId, data.postId);
    }

    @MessagePattern({ cmd: 'deleteBookmark' })
    async deleteBookmark(data: { userId: string; postId: string }) {
        return await this.postService.deleteBookmark(data.userId, data.postId);
    }

    @MessagePattern({ cmd: 'getUserBookmarks' })
    async getUserBookmarks(data: {
        userId: string;
        page: number;
        pageSize: number;
    }) {
        return await this.postService.getUserBookmarks(
            data.userId,
            data.page,
            data.pageSize,
        );
    }

    @MessagePattern({ cmd: 'isPostBookmarked' })
    async isPostBookmarked(data: { userId: string; postId: string }) {
        return await this.postService.isPostBookmarked(
            data.userId,
            data.postId,
        );
    }
}
