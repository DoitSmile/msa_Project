import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from '@shared/entites/board/board.entity';

import { Repository } from 'typeorm';
@Injectable()
export class BoardService {
    constructor(
        @InjectRepository(Board)
        private readonly boardRepository: Repository<Board>,
    ) {}

    async createBoard(createBoardInput, name, userId) {
        console.log('createBoardInput:', createBoardInput);
        const { title, content } = createBoardInput;

        return await this.boardRepository.save({
            userId: userId,
            name: name,
            title,
            content,
        });
    }

    async fetchMyBoard(Id) {
        return await this.boardRepository.find({
            where: { userId: Id },
        });
    }
}
