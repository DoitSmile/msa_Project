import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { BoardService } from './board.service';

@Controller()
export class BoardController {
    constructor(private readonly boardService: BoardService) {}

    // 게시물 생성
    @MessagePattern({ cmd: 'createBoard' })
    async createBoard(data) {
        console.log('data:', data);
        return await this.boardService.createBoard(
            data.createBoardInput,
            data.name,
            data.userId,
        );
    }

    // 내 게시물 조회
    @MessagePattern({ cmd: 'fetchMyBoard' })
    async fetchMyBoard(data) {
        console.log('data:', data);
        return await this.boardService.fetchMyBoard(data.userId);
    }

    // 전체 게시글 조회
    @MessagePattern({ cmd: 'fetchBoards' })
    async fetchBoards() {
        return await this.boardService.fetchBoards();
    }
}
