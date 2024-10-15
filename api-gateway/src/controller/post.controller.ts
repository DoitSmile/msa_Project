import {
  Body,
  Controller,
  Inject,
  Post,
  Get,
  Delete,
  Query,
  Put,
  Req,
  UseGuards,
  Param,
  UseInterceptors,
  UploadedFiles,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateCommentInput } from 'src/dto/postdto/create-comment.input-dto';
import { CreatPostInput } from 'src/dto/postdto/create-post.input-dto';
import { UpdatePostInput } from 'src/dto/postdto/update-post.input-dto';

@Controller()
export class PostController {
  constructor(
    @Inject('POST_SERVICE')
    private readonly clientPostService: ClientProxy,
  ) {}

  // 게시글 작성
  @UseGuards(AuthGuard('access'))
  @Post('/post/create')
  @UseInterceptors(FilesInterceptor('images', 10))
  async createPost(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createPostInput: CreatPostInput,
    @Req() req,
  ) {
    const name = req.user.name;
    const userId = req.user.id;

    const fileData = files.map((file) => ({
      originalname: file.originalname,
      mimetype: file.mimetype,
      buffer: file.buffer.toString('base64'),
    }));

    try {
      const result = await this.clientPostService
        .send(
          { cmd: 'createPost' },
          { createPostInput, name, userId, files: fileData },
        )
        .toPromise();

      return result;
    } catch (error) {
      throw new InternalServerErrorException('Post creation failed');
    }
  }
  @UseGuards(AuthGuard('access'))
  @Put('/post/update/:postId')
  @UseInterceptors(FilesInterceptor('images', 10))
  async updatePost(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('postId') postId: string,
    @Body() updatePostInput: UpdatePostInput,
  ) {
    const fileData = files.map((file) => ({
      originalname: file.originalname,
      mimetype: file.mimetype,
      buffer: file.buffer.toString('base64'),
    }));

    try {
      const result = await this.clientPostService
        .send(
          { cmd: 'updatePost' },
          { postId, updatePostInput, files: fileData },
        )
        .toPromise();

      return result;
    } catch (error) {
      throw new InternalServerErrorException('Post update failed');
    }
  }

  // 게시글 삭제
  @UseGuards(AuthGuard('access'))
  @Delete('/post/delete/:id')
  deletePosts(@Param('id') postId: string) {
    return this.clientPostService.send({ cmd: 'deletePost' }, { postId });
  }

  // 유저 게시글 조회
  @Get('/post/user_fetch/:id')
  async fetchMyPost(
    @Param('id') userId: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    return this.clientPostService.send(
      { cmd: 'fetchMyPost' },
      { userId, page, pageSize },
    );
  }
  // 게시글 조회
  @Get('/post/fetch/:id')
  async fetchPost(
    @Param('id') postId: string,
    @Query('userId') userId: string,
  ) {
    return this.clientPostService.send(
      { cmd: 'fetchPost' },
      { postId, userId },
    );
  }
  // 카테고리별 게시글 조회
  @Get('/post/fetch/category/:categoryId')
  fetchCategoryPosts(@Param('categoryId') categoryId) {
    return this.clientPostService.send(
      { cmd: 'fetchCategoryPosts' },
      { categoryId },
    );
  }
  // 전체 게시글 조회
  @Get('/posts/fetch/all')
  fetchPosts() {
    return this.clientPostService.send({ cmd: 'fetchPosts' }, {});
  }

  // ------------------------ Comment ------------------------
  // 댓글 작성
  @UseGuards(AuthGuard('access'))
  @Post('/post/comment/create')
  createComment(@Body() createCommentInput: CreateCommentInput, @Req() req) {
    const userId = req.user.id;
    const username = req.user.name;
    return this.clientPostService.send(
      { cmd: 'createComment' },
      { createCommentInput, username, userId },
    );
  }

  // 댓글 조회
  @Get('/post/comment/fetch/:postId')
  async fetchComment(@Param('postId') postId) {
    return this.clientPostService.send({ cmd: 'fetchComment' }, { postId });
  }

  @Get('/post/comment/user/:userId')
  async fetchUserComments(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    return this.clientPostService.send(
      { cmd: 'fetchUserComments' },
      { userId, page, pageSize },
    );
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
  deleteComment(@Param('id') commentId: string) {
    return this.clientPostService.send({ cmd: 'deleteComment' }, { commentId });
  }

  //  ------------------------ View, Popular ------------------------
  // 조회수 조회
  @Get('/post/views/:id')
  async getPostViews(@Param('id') postId: string) {
    return this.clientPostService.send({ cmd: 'getPostViews' }, { postId });
  }
  // 인기 게시글 조회
  @Get('/posts/popular')
  async getPopularPosts(@Query('limit') limit: number = 10) {
    return this.clientPostService.send({ cmd: 'getPopularPosts' }, { limit });
  }

  @Get('/posts/search')
  async searchPosts(
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    console.log('실행');
    return this.clientPostService.send(
      { cmd: 'searchPosts' },
      { query, page, pageSize },
    );
  }
}
