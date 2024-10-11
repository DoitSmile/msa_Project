import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '@shared/entites/post/post.entity';
import { Comment } from '@shared/entites/post/post-comment.entity';
import { IsNull, Repository } from 'typeorm';

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
            { id: postId }, // 무엇에 대하여
            { title, content }, // 무엇을 수정할 것인지
        );
    }

    // 게시글 삭제
    async deletePosts(postId) {
        return await this.postRepository.softRemove({ id: postId });
    }

    // 전체 게시글 보기 (최신순)
    async fetchPosts() {
        return await this.postRepository.find({
            order: {
                createdAt: 'DESC', // 생성일 기준 내림차순 정렬 (최신순)
            },
            take: 100, // 최대 100개의 게시글만 가져옴
            relations: ['category'],
        });
    }

    // 카테고리별 게시글 보기
    async fetchCategoryPosts(categoryId) {
        console.log('최종:', categoryId);
        return await this.postRepository.find({
            where: { category: categoryId },
            order: {
                createdAt: 'DESC', // 생성일 기준 내림차순 정렬 (최신순)
            },
            take: 100, // 최대 100개의 게시글만 가져옴
            relations: ['category'],
        });
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

        return {
            posts,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }


    // 특정 게시글 보기
    async fetchPost(postId) {
        console.log('postId:', postId);
        return await this.postRepository.find({
            where: { id: postId },
            relations: ['category'],
        });
    }
    // ---------------------------- comment  ----------------------------

    // 댓글 생성
    async createComment(createCommentInput, username, userId) {
        const { postId, parentId, content } = createCommentInput;

        const post = await this.postRepository.findOne({
            where: { id: postId },
        });

        if (!post) {
            throw new NotFoundException('글이 없습니다.');
        }

        // parent 변수가 Comment 타입의 객체이거나 null일 수 있음을 나타냄, 변수를 null로 초기화합니다.
        // parentId가 존재할 경우 , 실제 부모 댓글이 있는지 확인
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
            // IsNull()은 항상 'IS NULL' SQL 조건으로 변환되어, 데이터베이스에서 NULL 값을 정확히 찾음
            // post는 Comment 엔티티에서 Post 엔티티로의 관계를 나타냄
            // { id: postId }는 해당 Post 엔티티의 id가 주어진 postId와 일치해야 함을 의미, 외래키에 접근
            // parent: null 이 조건은 최상위 댓글만을 선택하기 위한 것
            relations: ['replies', 'replies.replies'],
            order: { createdAt: 'DESC' }, //최신 댓글순으로 정렬
        });
    }

    // 댓글 조회 (유저별)
    async fetchUserComments(userId: string, page: number = 1, pageSize: number = 10) {
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
}
