import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class UserController {
  // constructor(private readonly appService) {}
  @MessagePattern({ cmd: 'createUser' })
  // @Get이나 @Post 같은 Rest-API의 Method가 아닌
  // MessagePattern 을 통해 gateway에서 각각의 API로 요청을 전달합니다.
  CreateUser(data) {
    //데이터 생성, 회원가입 진행
    console.log(data);
    return '회원가입완료';
  }
}
