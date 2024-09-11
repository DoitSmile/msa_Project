import { Body, Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import { CreateBoardInput } from 'src/dto/boarddto/create-board.input-dto';

@Controller()
export class BoardController {
  constructor(
    @Inject('BOARD_SERVICE')
    private readonly clientBoardService: ClientProxy,
  ) {}
  // ---------------------------- board  ----------------------------

  // 게시물 생성
  @UseGuards(AuthGuard('access'))
  @Post('/board/create')
  createBoard(@Body() createBoardInput: CreateBoardInput, @Req() req) {
    const name = req.user.name;
    const userId = req.user.id;
    console.log('createBoardInput:', createBoardInput);
    return this.clientBoardService.send(
      { cmd: 'createBoard' },
      { createBoardInput, name, userId },
    );
  }

  // 내 게시물 조회
  @UseGuards(AuthGuard('access'))
  @Post('/board/fetch')
  fetchMyBoard(@Req() req) {
    const userId = req.user.id;
    console.log('userId:', userId);
    return this.clientBoardService.send({ cmd: 'fetchMyBoard' }, { userId });
  }

  // 전체 게시물 조회
  @Post('/board/fetch/all')
  fetchBoards(@Req() req) {
    return this.clientBoardService.send({ cmd: 'fetchBoards' }, {});
  }

  // 카테고리 전체 조회
  @Post('/board/category')
  fetchCategory() {
    return this.clientBoardService.send({ cmd: 'fetchBoards' }, {});
  }
}
