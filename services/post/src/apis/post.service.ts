import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '@shared/entites/post/post.entity';
import { Comment } from '@shared/entites/post/post-comment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PostService {
    constructor(
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,
    ) {}

    // ---------------------------- post  ----------------------------
    // 게시물 생성
    async createPost(createPostInput, name, userId) {
        console.log('createPostInput:', createPostInput);
        const { title, content } = createPostInput;

        return await this.postRepository.save({
            userId: userId,
            name: name,
            title,
            content,
        });
    }

    // 게시글 수정
    async updatePost(postId, updatePostInput) {
        console.log('updatePostInput:', updatePostInput);
        const { title, content } = updatePostInput;
        return await this.postRepository.update(
            { id: postId }, // 무엇에 대하여
            { title, content }, // 무엇을 수정할 것인지
        );
    }

    // 게시글 삭제
    async deletePosts(postId) {
        return await this.postRepository.softRemove({ id: postId });
    }
    // 전체 게시글 보기
    async fetchPosts() {
        return await this.postRepository.find();
    }

    // 내 게시글 보기
    async fetchPost(Id) {
        console.log('Id:', Id);
        return await this.postRepository.find({
            where: { userId: Id },
        });
    }

    // ---------------------------- comment  ----------------------------

    // 댓글 생성
    async createComment(createCommentInput, userId) {
        console.log('----------------------service-----------------------');
        console.log('createCommentInput:', createCommentInput);
        console.log('userId:', userId);

        const { postId, parentId, content } = createCommentInput;
        console.log('----------------------service-----------------------');

        console.log('postId:', postId);
        const post = await this.postRepository.findOne({
            where: { id: postId },
        });

        if (!post) {
            throw new NotFoundException('글이 없습니다.');
        }

        //parent 변수가 Comment 타입의 객체이거나 null일 수 있음을 나타냄, 변수를 null로 초기화합니다.
        let parent: Comment | null = null;
        if (parentId) {
            parent = await this.commentRepository.findOne({
                where: { id: parentId.parentId },
            });
            if (!parent) {
                throw new NotFoundException('Parent comment not found');
            }
        }

        const comment = this.commentRepository.create({
            content,
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
            where: { post: { id: postId.postId }, parent: null },
            // post는 Comment 엔티티에서 Post 엔티티로의 관계를 나타냄
            // { id: postId }는 해당 Post 엔티티의 id가 주어진 postId와 일치해야 함을 의미
            // parent: null 이 조건은 최상위 댓글만을 선택하기 위한 것
            relations: ['replies', 'replies.replies'],
            order: { createdAt: 'DESC' },
        });
    }

    // 댓글 수정
    // 댓글 삭제
}
