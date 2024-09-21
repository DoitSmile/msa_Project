import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '@shared/entites/post/post.entity';
import { Comment } from '@shared/entites/post/post-comment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  // ---------------------------- post  ----------------------------
  // 제품 생성
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
}
