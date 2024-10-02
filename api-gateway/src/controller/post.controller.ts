import { Body, Controller, Inject, Post,Get,Delete, Put,Req, UseGuards,Param } from '@nestjs/common';
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
  @Put('/post/update')
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
  @Delete('/post/delete')
  deletePosts(@Body('postId') postId: string) {
    return this.clientPostService.send({ cmd: 'deletePost' }, { postId });
  }

  // 내 게시물 조회
  @UseGuards(AuthGuard('access'))
  @Get('/post/user_fetch/:id')
  fetchMyPost(@Req() req) {
    const userId = req.user.id;
    console.log('userId:', userId);
   
    return this.clientPostService.send({ cmd: 'fetchMyPost' }, { userId });
  }

    // 특정 게시물 조회
    @Get('/post/fetch/:id')
    fetchPost(@Param('id') postId:string) {
      console.log('postId:', postId);
      return this.clientPostService.send({ cmd: 'fetchPost' }, { postId });
    }

  
  // 카테고리별 게시물 조회
  @Get('/post/fetch/category')
  fetchCategoryPosts(categoryId) {
    return this.clientPostService.send({ cmd: 'fetchCategoryPosts' }, {categoryId});
  }


  // 전체 게시물 조회
  @Get('/posts/fetch/all')
  fetchPosts() {
    return this.clientPostService.send({ cmd: 'fetchPosts' }, {});
  }

  // 카테고리 생성 

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
  @Get('/post/comment/fetch')
  fetchComment(@Body() postId) {
    console.log('postId:', postId);
    return this.clientPostService.send({ cmd: 'fetchComment' }, { postId });
  }

  // 댓글 수정
  @Put('/post/comment/update')
  updateComment(
    @Body('commentId') commentId: string,
    @Body('content') content: string,
  ) {
    return this.clientPostService.send(
      { cmd: 'updateComment' },
      { commentId, content },
    );
  }

  // 댓글 삭제
  @Delete('/post/comment/delete')
  deleteComment(@Body('commentId') commentId: string) {
    return this.clientPostService.send({ cmd: 'deleteComment' }, { commentId });
  }
}
