import { Body, Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import { CreateCommentInput } from 'src/dto/postdto/create-comment.input-dto';
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
  @UseGuards(AuthGuard('access'))
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
  @Post('/post/fetch/all')
  fetchPosts() {
    return this.clientPostService.send({ cmd: 'fetchPosts' }, {});
  }

  // ---------------------------- comment  ----------------------------
  // 댓글 생성
  @UseGuards(AuthGuard('access'))
  @Post('/post/comment/create')
  createComment(@Body() createCommentInput: CreateCommentInput, @Req() req) {
    const userId = req.user.id;
    return this.clientPostService.send(
      { cmd: 'createComment' },
      { createCommentInput, userId },
    );
  }

  // 댓글 조회
  @UseGuards(AuthGuard('access'))
  @Post('/post/comment/fetch')
  fetchComment(@Body() postId) {
    console.log('postId:', postId);
    return this.clientPostService.send({ cmd: 'fetchComment' }, { postId });
  }

  // 댓글 수정
  @Post('/post/comment/update')
  updateComment() {
    return this.clientPostService.send({ cmd: 'updateComment' }, {});
  }

  // 댓글 삭제
  @Post('/post/comment/create')
  deleteComment() {
    return this.clientPostService.send({ cmd: 'deleteComment' }, {});
  }
}
