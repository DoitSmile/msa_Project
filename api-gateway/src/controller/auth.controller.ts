import {
  Body,
  Controller,
  Inject,
  Post,
  Get,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import { lastValueFrom } from 'rxjs';
import { AuthLoginInput } from 'src/dto/authdto/auth-login.Input';

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
    try {
      const { refreshToken, accessToken } = await lastValueFrom(
        this.clientAuthService.send({ cmd: 'login' }, { authLoginInput }),
      );

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
        domain: 'localhost',
      });

      res.header('Authorization', `Bearer ${accessToken}`);

      return { accessToken };
    } catch (error) {
      // 에러 처리
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException('Invalid credentials');
      }
      throw new InternalServerErrorException('Login failed');
    }
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
}
