// post-service/src/post.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PostService } from './post.service';

@Controller()
export class PostController {
    constructor(private readonly postService: PostService) {}

    // 게시물 생성
    @MessagePattern({ cmd: 'createPost' })
    async createPost(data) {
        console.log('data:', data);
        return await this.postService.createPost(
            data.createPostInput,
            data.name,
            data.userId,
        );
    }

    // 게시글 수정
    @MessagePattern({ cmd: 'updatePost' })
    async updatePost(data) {
        console.log('data:', data);
        return await this.postService.updatePost(
            data.postId,
            data.updatePostInput,
        );
    }

    // 게시글 삭제
    @MessagePattern({ cmd: 'deletePost' })
    async deletePosts(data) {
        console.log('data:', data);
        return await this.postService.deletePosts(data.postId);
    }

    // 내 게시물 조회
    @MessagePattern({ cmd: 'fetchMyPost' })
    async fetchMyPost(data) {
        console.log('data:', data);
        return await this.postService.fetchMyPost(
            data.userId,
            data.page,
            data.pageSize,
        );
    }

    // 특정 게시물 조회
    @MessagePattern({ cmd: 'fetchPost' })
    async fetchPost(data) {
        console.log('data:', data);
        return await this.postService.fetchPost(data.postId);
    }

    // 전체 게시글 조회
    @MessagePattern({ cmd: 'fetchPosts' })
    async fetchPosts() {
        return await this.postService.fetchPosts();
    }

    // 카테고리별 게시글 조회
    @MessagePattern({ cmd: 'fetchCategoryPosts' })
    async fetchCategoryPosts(data: { categoryId: string }) {
        console.log('데이터:', data);
        return await this.postService.fetchCategoryPosts(data.categoryId);
    }

    // 댓글 생성
    @MessagePattern({ cmd: 'createComment' })
    async createComment(data) {
        console.log('data:', data);
        return await this.postService.createComment(
            data.createCommentInput,
            data.username,
            data.userId,
        );
    }

    // 댓글 조회
    @MessagePattern({ cmd: 'fetchComment' })
    async fetchComment(data) {
        console.log('data:', data);
        return await this.postService.fetchComment(data.postId);
    }

    // 유저 댓글 조회
    @MessagePattern({ cmd: 'fetchUserComments' })
    async fetchUserComments(data) {
        console.log('data:', data);
        return await this.postService.fetchUserComments(
            data.userId,
            data.page,
            data.pageSize,
        );
    }

    // 댓글 수정
    @MessagePattern({ cmd: 'updateComment' })
    async updateComment(data) {
        console.log('data:', data);
        return await this.postService.updateComment(
            data.commentId,
            data.content,
        );
    }

    // 댓글 삭제
    @MessagePattern({ cmd: 'deleteComment' })
    async deleteComment(data) {
        console.log('data:', data);
        return await this.postService.deleteComment(data.commentId);
    }

    // 조회수 조회
    @MessagePattern({ cmd: 'getPostViews' })
    async getPostViews(data) {
        console.log('data:', data);
        return await this.postService.getPostViews(data.postId);
    }

    // 인기 게시물 조회
    @MessagePattern({ cmd: 'getPopularPosts' })
    async getPopularPosts(data) {
        console.log('data:', data);
        return await this.postService.getPopularPosts(data.limit);
    }
}
