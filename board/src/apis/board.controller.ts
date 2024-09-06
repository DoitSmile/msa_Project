import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { BoardService } from './board.service';

@Controller()
export class BoardController {
    constructor(private readonly boardService: BoardService) {}

    @MessagePattern({ cmd: 'createBoard' })
    async createBoard(data) {
        console.log('data:', data);
        return await this.boardService.createBoard(
            data.createBoardInput,
            data.name,
            data.userId,
        );
    }

    @MessagePattern({ cmd: 'fetchMyBoard' })
    async fetchMyBoard(data) {
        console.log('data:', data);
        return await this.boardService.fetchMyBoard(data.id);
    }
}
