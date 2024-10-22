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
import { UserDataService } from '../service/user-data.service';

@Controller()
export class PostController {
  constructor(
    @Inject('POST_SERVICE')
    private readonly clientPostService: ClientProxy,
    private readonly userDataService: UserDataService,
  ) {}

  // 게시글 작성
  @UseGuards(AuthGuard('access'))
  @Post('api/post/create')
  @UseInterceptors(FilesInterceptor('images', 10))
  async createPost(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createPostInput: CreatPostInput,
    @Req() req,
  ) {
    const userId = req.user.id;
    const userName = await this.userDataService.getUserName(userId);

    console.log('들어온값:', createPostInput);
    const fileData = files.map((file) => ({
      originalname: file.originalname,
      mimetype: file.mimetype,
      buffer: file.buffer.toString('base64'),
    }));

    try {
      const result = await this.clientPostService
        .send(
          { cmd: 'createPost' },
          { createPostInput, userId, userName, files: fileData },
        )
        .toPromise();

      return result;
    } catch (error) {
      throw new InternalServerErrorException('Post creation failed');
    }
  }
  @UseGuards(AuthGuard('access'))
  @Put('api/post/update/:postId')
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

  @UseGuards(AuthGuard('access'))
  @Delete('api/post/delete/:id')
  deletePosts(@Param('id') postId: string) {
    return this.clientPostService.send({ cmd: 'deletePost' }, { postId });
  }

  @Get('api/post/user_fetch/:id')
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

  @Get('api/post/fetch/:id')
  async fetchPost(
    @Param('id') postId: string,
    @Query('userId') userId: string,
  ) {
    return this.clientPostService.send(
      { cmd: 'fetchPost' },
      { postId, userId },
    );
  }

  @Get('api/post/fetch/category/:categoryId')
  fetchCategoryPosts(
    @Param('categoryId') categoryId: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
  ) {
    return this.clientPostService.send(
      { cmd: 'fetchCategoryPosts' },
      { categoryId, page, pageSize },
    );
  }

  @Get('api/posts/fetch/all')
  fetchPosts(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
  ) {
    return this.clientPostService.send(
      { cmd: 'fetchPosts' },
      { page, pageSize },
    );
  }

  @Get('api/posts/popular')
  async getPopularPosts(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
  ) {
    return this.clientPostService.send(
      { cmd: 'getPopularPosts' },
      { page, pageSize },
    );
  }

  @Get('api/posts/search')
  async searchPosts(
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('sort') sort: string = 'date',
  ) {
    console.log('Search request received:', { query, page, pageSize, sort });
    return this.clientPostService.send(
      { cmd: 'searchPosts' },
      { query, page, pageSize, sort },
    );
  }

  // ------------------------ Comment ------------------------
  // 댓글 작성
  @UseGuards(AuthGuard('access'))
  @Post('api/post/comment/create')
  async createComment(
    @Body() createCommentInput: CreateCommentInput,
    @Req() req,
  ) {
    const userId = req.user.id;
    const userName = await this.userDataService.getUserName(userId);
    return this.clientPostService.send(
      { cmd: 'createComment' },
      { createCommentInput, userId, userName },
    );
  }

  // 댓글 조회
  @Get('api/post/comment/fetch/:postId')
  async fetchComment(@Param('postId') postId) {
    return this.clientPostService.send({ cmd: 'fetchComment' }, { postId });
  }

  @Get('api/post/comment/user/:userId')
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
  @Put('api/post/comment/update')
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
  @Delete('api/post/comment/delete/:id')
  deleteComment(@Param('id') commentId: string) {
    return this.clientPostService.send({ cmd: 'deleteComment' }, { commentId });
  }

  //  ------------------------ View, BookMark ------------------------
  // 조회수 조회
  @Get('api/post/views/:id')
  async getPostViews(@Param('id') postId: string) {
    return this.clientPostService.send({ cmd: 'getPostViews' }, { postId });
  }

  // 북마크한 목록 조회
  @UseGuards(AuthGuard('access'))
  @Post('api/post/bookmark/:postId')
  async toggleBookmark(@Param('postId') postId: string, @Req() req) {
    const userId = req.user.id;

    try {
      const result = await this.clientPostService
        .send({ cmd: 'createBookmark' }, { userId, postId })
        .toPromise();
      return result;
    } catch (error) {
      console.error('Error in toggleBookmark:', error);
      throw new InternalServerErrorException('북마크 토글에 실패했습니다.');
    }
  }

  @UseGuards(AuthGuard('access'))
  @Delete('api/post/bookmark/:postId')
  async deleteBookmark(@Param('postId') postId: string, @Req() req) {
    const userId = req.user.id;
    return this.clientPostService.send(
      { cmd: 'deleteBookmark' },
      { userId, postId },
    );
  }

  @UseGuards(AuthGuard('access'))
  @Get('api/user/bookmarks')
  async getUserBookmarks(
    @Req() req,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    const userId = req.user.id;
    return this.clientPostService.send(
      { cmd: 'getUserBookmarks' },
      { userId, page, pageSize },
    );
  }

  @UseGuards(AuthGuard('access'))
  @Get('api/post/isBookmarked/:postId')
  async isPostBookmarked(@Param('postId') postId: string, @Req() req) {
    const userId = req.user.id;
    return this.clientPostService.send(
      { cmd: 'isPostBookmarked' },
      { userId, postId },
    );
  }
}
