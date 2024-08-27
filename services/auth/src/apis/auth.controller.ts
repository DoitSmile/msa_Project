import { Controller, Get } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';
// import { AppService } from './app.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 로그인
  @MessagePattern({ cmd: 'login' })
  async login(data) {
    console.log('token:', data);

    const token = await this.authService.login(data.authLoginInput);
    return 'accessToken!!!';
  }

  logout() {
    // 로그아웃 진행
  }
  // 토큰 재발급

  // @MessagePattern({ cmd: 'restoreAccessToken' })
  // restoreAccessToken(data) {
  //   data
  //   return this.authService.restoreAccessToken({ user: req.user });

  // }
}