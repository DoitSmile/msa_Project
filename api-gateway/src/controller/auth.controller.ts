import {
  Body,
  Controller,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import { lastValueFrom } from 'rxjs';
import { AuthLoginInput } from 'src/dto/authdto/auth-login.Input';
import { AuthPhoneInput } from 'src/dto/authdto/check-phone.Input';

@Controller()
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly clientAuthService: ClientProxy,
  ) {}

  // ---------------------------- auth --------------------------------------------

  // 로그인 api
  @Post('/auth/login')
  async login(
    @Body() authLoginInput: AuthLoginInput,
    @Res({ passthrough: true }) res,
  ) {
    // res.send(token);
    const { refreshToken, accessToken } = await lastValueFrom(
      this.clientAuthService.send({ cmd: 'login' }, { authLoginInput }),
    );

    //res.cookie를 통해 클라이언트한테 쿠키를 전달 가능
    res.cookie('Authentication', refreshToken, {
      domain: 'localhost',
      path: '/',
      httpOnly: true,
    });
    return accessToken;
  }

  // 토큰 재발급 api
  @UseGuards(AuthGuard('refresh'))
  @Post('/auth/reissueToken')
  async restoreAccessToken(@Req() req) {
    console.log('req.user:', req.user);
    return await this.clientAuthService.send(
      { cmd: 'restoreAccessToken' },
      { user: req.user },
    );
  }

  // 핸드폰 인증번호 발송 api
  @Post('/auth/sendPhone')
  async sendPhone(@Body('phone_num') phone_num: string) {
    console.log('phone_num:', phone_num);
    return await this.clientAuthService.send(
      { cmd: 'sendPhone' },
      { phone_num },
    );
  }

  // 핸드폰 인증번호 확인 로직 api
  @Post('/auth/checkPhone')
  async checkValidPhone(@Body() authPhoneInput: AuthPhoneInput) {
    console.log('auth_num:', authPhoneInput);

    return await this.clientAuthService.send(
      { cmd: 'checkValidPhone' },
      { authPhoneInput },
    );
  }
}
