import { Controller, Get } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { Inject } from '@nestjs/common';

// import { AppService } from './app.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 로그인
  @MessagePattern({ cmd: 'login' })
  async login(data) {
    console.log('data.authLoginInput:', data.authLoginInput);
    return this.authService.login(data.authLoginInput);
  }

  @MessagePattern({ cmd: 'logout' })
  // 로그아웃 진행
  async logout(data) {
    return this.authService.logout(data.id);
  }

  // 토큰 재발급
  @MessagePattern({ cmd: 'restoreAccessToken' })
  async restoreAccessToken(data) {
    console.log('data:', data);
    const user = data.user;
    // console.log('restoreAccessToken user:', user);
    // const refreshToken = data.refreshToken;
    return await this.authService.restoreAccessToken({
      user: user,
    });
  }


}
