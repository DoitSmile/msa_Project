import { Body, Controller, Inject, Post,Get,Delete, Query,Put,Req, UseGuards,Param } from '@nestjs/common';
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
  @Delete('/post/delete/:id')
  deletePosts(@Param('id') postId: string) {
    console.log("postId 삭제쪽",postId)
    return this.clientPostService.send({ cmd: 'deletePost' }, { postId });
  }


  // 내 게시물 조회
  @Get('/post/user_fetch/:id')
    async fetchMyPost(@Param('id') userId: string) {
        console.log('게시물 userId:', userId);
        return this.clientPostService.send({ cmd: 'fetchMyPost' }, { userId });
    }

    // 특정 게시물 조회
    @Get('/post/fetch/:id')
    fetchPost(@Param('id') postId:string) {
      console.log('postId:', postId);
      return this.clientPostService.send({ cmd: 'fetchPost' }, { postId });
    }

  
  // 카테고리별 게시물 조회
  @Get('/post/fetch/category/:categoryId')
  fetchCategoryPosts(@Param() categoryId) {
    console.log("categoryId:",categoryId)
    return this.clientPostService.send({ cmd: 'fetchCategoryPosts' }, {categoryId});
  }


  // 전체 게시물 조회
  @Get('/posts/fetch/all')
  fetchPosts() {
    return this.clientPostService.send({ cmd: 'fetchPosts' }, {});
  }

  

  // ---------------------------- comment  ----------------------------
  // 댓글 생성
  @UseGuards(AuthGuard('access'))
  @Post('/post/comment/create')
  createComment(@Body() createCommentInput: CreateCommentInput, @Req() req) {
    const userId = req.user.id;
    const username = req.user.name;
    console.log("댓글의 userId:",userId)
    return this.clientPostService.send(
      { cmd: 'createComment' },
      { createCommentInput, username,userId },
    );
  }

  // 댓글 조회
  @Get('/post/comment/fetch/:postId')
  async fetchComment(@Param('postId') postId) {
    console.log('댓글postId:', postId);
    const result = await this.clientPostService.send({ cmd: 'fetchComment' }, { postId }).toPromise();
    return Array.isArray(result) ? result : [];
  }

 // 유저 댓글 조회
  @Get('/post/comment/user/:userId')
  async fetchUserComments(@Param('userId') userId: string) {
      console.log('댓글 userId:', userId);
      return this.clientPostService.send({ cmd: 'fetchUserComments' }, { userId });
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
  @Delete('/post/comment/delete/:id')
  deleteComment(@Body('commentId') commentId: string) {
    return this.clientPostService.send({ cmd: 'deleteComment' }, { commentId });
  }
}
