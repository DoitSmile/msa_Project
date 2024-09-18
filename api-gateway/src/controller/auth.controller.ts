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

  // ---------------------------- auth ----------------------------

  // 로그인 api
  @Post('/auth/login')
  async login(
    @Body() authLoginInput: AuthLoginInput,
    @Res({ passthrough: true }) res,
    //passthrough 는 @Res데코레이터와 함께 쓰임,  NestJS의 자동 응답 처리 기능을 사용할 수 있게된다. 쓰지 않을 경우  res.send(), res.json() 등을 직접 호출해야 함
  ) {
    const { refreshToken, accessToken } = await lastValueFrom(
      // lastValueFrom: 마지막으로 나온 값을 잡아서 돌려줌
      // 로그인 프로세스에서는 일반적으로 하나의 최종 결과(성공 또는 실패)만을 기대
      // lastValueFrom은 이 최종 결과를 캡처하는데 이상적
      this.clientAuthService.send({ cmd: 'login' }, { authLoginInput }),
    );

    // 클라이언트한테 쿠키 전달
    res
      .header('Authorization', accessToken)
      .cookie('refreshToken', refreshToken, {
        // Set-Cookie 헤더에 저장
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60, // 1주일 (7일 * 24시간 * 60분 * 60초 = 604,800초).
      });
    return accessToken;
  }

  // 로그아웃 api
  @UseGuards(AuthGuard('access'))
  @Post('/auth/logout')
  async logout(@Res({ passthrough: true }) res, @Req() req) {
    const user = req.user;
    res.clearCookie('refreshToken');
    return await this.clientAuthService.send({ cmd: 'logout' }, { user: user });
  }

  // 토큰 재발급 api
  @UseGuards(AuthGuard('refresh'))
  //인가를 성공하면 validate의 payload를 열어서 사용자의 정보를 반환해 주기에 유저 정보를 꺼내올 수 있다.
  @Post('/auth/reissueToken')
  async restoreAccessToken(@Req() req) {
    const user = req.user;
    // const refreshToken = req.cookies['refreshToken'];
    // redis에 저장된 refreshToken과 일치확인을 위해 cookie에있는 값 가져옴
    return await this.clientAuthService.send(
      { cmd: 'restoreAccessToken' },
      { user: user },
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
