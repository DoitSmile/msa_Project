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

    // ---------------------------- comment  ----------------------------
    // 댓글 생성
    @MessagePattern({ cmd: 'createComment' })
    async createComment(data) {
        console.log('data:', data);
        return await this.postService.createComment(
            data.createCommentInput,
            data.userId,
        );
    }
    // 댓글 조회

    @MessagePattern({ cmd: 'fetchComment' })
    async fetchComment(data) {
        console.log('data:', data);
        return await this.postService.fetchComment(data.postId);
    }
    // 댓글 수정
    // 댓글 삭제
}
