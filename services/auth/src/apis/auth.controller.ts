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
    console.log('data.authLoginInput:', data.authLoginInput);
    return this.authService.login(data.authLoginInput);
  }

  logout() {
    // 로그아웃 진행
  }

  // 토큰 재발급
  @MessagePattern({ cmd: 'restoreAccessToken' })
  async restoreAccessToken(user) {
    return await this.authService.restoreAccessToken({ user: user.id });
  }

  // 핸드폰 인증 발송
  @MessagePattern({ cmd: 'sendPhone' })
  async sendPhone(data) {
    console.log('phone_num:', data);
    const phone_num = await data.phone_num;
    console.log('에러찾기5:');
    return await this.authService.sendPhone(phone_num);
  }

  // 핸드폰 인증 확인
  @MessagePattern({ cmd: 'checkValidPhone' })
  async checkValidPhone(data) {
    console.log('auth_num/c', data.authPhoneInput);

    const authPhoneInput = await data.authPhoneInput;
    return await this.authService.checkValidPhone(authPhoneInput);
  }
}
