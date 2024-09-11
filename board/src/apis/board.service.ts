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

    // 글 작성
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

    // 내 게시글 보기
    async fetchBoards() {
        return await this.boardRepository.find();
    }

    // 전체 게시글 보기
    async fetchMyBoard(Id) {
        console.log('Id:', Id);
        return await this.boardRepository.find({
            where: { userId: Id },
        });
    }

    // 카테고리 조회
}
