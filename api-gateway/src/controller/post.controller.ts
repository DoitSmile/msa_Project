// api-gateway/src/controller/post.controller.ts
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
  UploadedFile,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateCommentInput } from 'src/dto/postdto/create-comment.input-dto';
import { CreatPostInput } from 'src/dto/postdto/create-post.input-dto';
import { UpdatePostInput } from 'src/dto/postdto/update-post.input-dto';

@Controller()
export class PostController {
  constructor(
    @Inject('POST_SERVICE')
    private readonly clientPostService: ClientProxy,
  ) {}

  @UseGuards(AuthGuard('access'))
  @Post('/post/create')
  @UseInterceptors(FileInterceptor('image'))
  async createPost(
    @UploadedFile() file: Express.Multer.File,
    @Body() createPostInput: CreatPostInput,
    @Req() req,
  ) {
    const name = req.user.name;
    const userId = req.user.id;

    let imageUrl = null;
    if (file) {
      const fileData = {
        filename: file.originalname,
        mimetype: file.mimetype,
        buffer: file.buffer.toString('base64'),
      };

      try {
        const uploadResult = await this.clientPostService
          .send({ cmd: 'uploadImage' }, fileData)
          .toPromise();
        imageUrl = uploadResult.url;
      } catch (error) {
        console.error('Image upload error:', error);
        throw new InternalServerErrorException('Image upload failed');
      }
    }

    // content에서 base64 이미지 URL을 실제 이미지 URL로 교체
    if (imageUrl) {
      createPostInput.content = createPostInput.content.replace(
        /<img[^>]*src="data:image\/[^;]+;base64,[^"]*"[^>]*>/g,
        `<img src="${imageUrl}" />`,
      );
    }

    return this.clientPostService.send(
      { cmd: 'createPost' },
      { createPostInput, name, userId, imageUrl },
    );
  }

  @UseGuards(AuthGuard('access'))
  @Put('/post/update/:postId')
  @UseInterceptors(FileInterceptor('image'))
  async updatePost(
    @UploadedFile() file: Express.Multer.File,
    @Param('postId') postId: string,
    @Body() updatePostInput: UpdatePostInput,
  ) {
    let imageUrl = null;
    if (file) {
      const fileData = {
        filename: file.originalname,
        mimetype: file.mimetype,
        buffer: file.buffer.toString('base64'),
      };

      try {
        const uploadResult = await this.clientPostService
          .send({ cmd: 'uploadImage' }, fileData)
          .toPromise();
        imageUrl = uploadResult.url;
      } catch (error) {
        console.error('Image upload error:', error);
        throw new InternalServerErrorException('Image upload failed');
      }
    }

    // content에서 base64 이미지 URL을 실제 이미지 URL로 교체
    if (imageUrl && updatePostInput.content) {
      updatePostInput.content = updatePostInput.content.replace(
        /<img[^>]*src="data:image\/[^;]+;base64,[^"]*"[^>]*>/g,
        `<img src="${imageUrl}" />`,
      );
    }

    return this.clientPostService.send(
      { cmd: 'updatePost' },
      { postId, updatePostInput, imageUrl },
    );
  }
  // 게시글 삭제
  @UseGuards(AuthGuard('access'))
  @Delete('/post/delete/:id')
  deletePosts(@Param('id') postId: string) {
    console.log('postId 삭제쪽', postId);
    return this.clientPostService.send({ cmd: 'deletePost' }, { postId });
  }

  // 내 게시물 조회
  @Get('/post/user_fetch/:id')
  async fetchMyPost(
    @Param('id') userId: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    console.log('게시물 userId:', userId, 'page:', page, 'pageSize:', pageSize);
    return this.clientPostService.send(
      { cmd: 'fetchMyPost' },
      { userId, page, pageSize },
    );
  }

  // 특정 게시물 조회
  @Get('/post/fetch/:id')
  async fetchPost(
    @Param('id') postId: string,
    @Query('userId') userId: string,
  ) {
    console.log('postId:', postId);
    return this.clientPostService.send(
      { cmd: 'fetchPost' },
      { postId, userId },
    );
  }

  // 카테고리별 게시물 조회
  @Get('/post/fetch/category/:categoryId')
  fetchCategoryPosts(@Param('categoryId') categoryId) {
    console.log('categoryId:', categoryId);
    return this.clientPostService.send(
      { cmd: 'fetchCategoryPosts' },
      { categoryId },
    );
  }

  // 전체 게시물 조회
  @Get('/posts/fetch/all')
  fetchPosts() {
    return this.clientPostService.send({ cmd: 'fetchPosts' }, {});
  }

  // 댓글 생성
  @UseGuards(AuthGuard('access'))
  @Post('/post/comment/create')
  createComment(@Body() createCommentInput: CreateCommentInput, @Req() req) {
    const userId = req.user.id;
    const username = req.user.name;
    console.log('댓글의 userId:', userId);
    return this.clientPostService.send(
      { cmd: 'createComment' },
      { createCommentInput, username, userId },
    );
  }

  // 댓글 조회
  @Get('/post/comment/fetch/:postId')
  async fetchComment(@Param('postId') postId) {
    console.log('댓글postId:', postId);
    return await this.clientPostService.send(
      { cmd: 'fetchComment' },
      { postId },
    );
  }

  // 유저 댓글 조회
  @Get('/post/comment/user/:userId')
  async fetchUserComments(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    console.log('댓글 userId:', userId, 'page:', page, 'pageSize:', pageSize);
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

  // 조회수 조회
  @Get('/post/views/:id')
  async getPostViews(@Param('id') postId: string) {
    return this.clientPostService.send({ cmd: 'getPostViews' }, { postId });
  }

  // 인기 게시물 조회
  @Get('/posts/popular')
  async getPopularPosts(@Query('limit') limit: number = 10) {
    return this.clientPostService.send({ cmd: 'getPopularPosts' }, { limit });
  }
}
