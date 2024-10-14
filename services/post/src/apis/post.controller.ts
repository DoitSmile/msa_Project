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

    @MessagePattern({ cmd: 'getPostViews' })
    async getPostViews(data) {
        return await this.postService.getPostViews(data.postId);
    }

    @MessagePattern({ cmd: 'getPopularPosts' })
    async getPopularPosts(data) {
        return await this.postService.getPopularPosts(data.limit);
    }
}
