import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}
  // @Get이나 @Post 같은 Rest-API의 Method가 아닌
  // MessagePattern 을 통해 gateway에서 각각의 API로 요청을 전달합니다.

  // 회원가입
  @MessagePattern({ cmd: 'createUser' })
  async createUser(data) {
    //데이터 생성, 회원가입 진행

    return await this.userService.createUser(data.createUserInput);
  }

  // 회원조회
  @MessagePattern({ cmd: 'fetchUser' })
  async fetchUser(data) {
    return await this.userService.fetchUser(data.id);
  }
}
