import { Controller, Get } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
// import { AppService } from './app.service';

@Controller()
export class AppController {
  // constructor(private readonly appService) {}

  @MessagePattern({ cmd: '이름' })
  //  @Get이나 @Post 같은 Rest-API의 Method가 아닌
  // MessagePattern 을 통해 gateway에서 각각의 API로 요청을 전달합니다.
  login2222(data) {
    // 로그인 진행
    console.log(data);

    return 'accessToken!!!';
  }

  logout() {
    // 로그아웃 진행
  }

  restoreAccessToken() {
    // 토큰 재발급
  }
}
