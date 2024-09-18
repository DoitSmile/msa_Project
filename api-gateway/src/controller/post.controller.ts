import {
  Body,
  Controller,
  Inject,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import { CreatPostInput } from 'src/dto/postdto/create-post.input-dto';
import { UpdatePostInput } from 'src/dto/postdto/update-post.input-dto';

@Controller()
export class PostController {
  constructor(
    @Inject('POST_SERVICE')
    private readonly clientPostService: ClientProxy,
  ) {}
  // ---------------------------- post  ----------------------------

  // 게시물 생성
  @UseGuards(AuthGuard('access'))
  @Post('/post/create')
  createPost(@Body() createPostInput: CreatPostInput, @Req() req) {
    const name = req.user.name;
    const userId = req.user.id;
    console.log('createPostInput:', createPostInput);
    return this.clientPostService.send(
      { cmd: 'createPost' },
      { createPostInput, name, userId },
    );
  }

  // 게시글 수정
  @UseGuards(AuthGuard('access'))
  @Post('/post/update')
  updatePost(
    @Body('postId') postId: string,
    @Body('updatePostInput') updatePostInput: UpdatePostInput,
  ) {
    console.log('postId:', postId);
    console.log('updatePostInput:', updatePostInput);
    return this.clientPostService.send(
      { cmd: 'updatePost' },
      { postId, updatePostInput },
    );
  }

  // 게시글 삭제
  @Post('/post/delete')
  deletePosts(@Body('postId') postId: string) {
    return this.clientPostService.send({ cmd: 'deletePost' }, { postId });
  }

  // 내 게시물 조회
  @UseGuards(AuthGuard('access'))
  @Post('/post/fetch')
  fetchPost(@Req() req) {
    const userId = req.user.id;
    console.log('userId:', userId);
    return this.clientPostService.send({ cmd: 'fetchPost' }, { userId });
  }

  // 전체 게시물 조회
  @Post('/post/fetchs')
  fetchPosts() {
    return this.clientPostService.send({ cmd: 'fetchPosts' }, {});
  }

  // 카테고리 전체 조회
  @Post('/post/category')
  fetchCategory() {
    return this.clientPostService.send({ cmd: 'fetchCategory' }, {});
  }
}
