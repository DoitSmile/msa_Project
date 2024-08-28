import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserInput } from './dto/create-user.input.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthLoginInput } from './authdto/auth-login.Input';
import { lastValueFrom } from 'rxjs';

// import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly clientAuthService: ClientProxy,
    @Inject('RESOURCE_SERVICE')
    private readonly clientResourceService: ClientProxy,
  ) {}

  // 회원가입
  @Post('/user/create')
  async createUser(@Body() createUserInput: CreateUserInput) {
    // auth-service로 트래픽 넘겨줌
    console.log('createUserInput:', createUserInput);
    return await this.clientResourceService.send(
      // return : 브라우저로 보내줌
      { cmd: 'createUser' }, // cmd:xx 넘길 패턴 이름
      { createUserInput }, //넘길 data
    );

    // `cmd`에는 앞서 각각의 API에서 작성했던 메세지 패턴을 적습니다.
    //API에 넘겨줄 데이터 값이 있다면 두번째 인자로 정할 수 있습니다. 넘겨줄 데이터 값이 없을 경우 빈 객체`{}`로 작성합니다.
  }

  // 회원조회
  @UseGuards(AuthGuard('access')) // UseGuards- > 로그인을 한 유저면 api 실행
  @Post('/user/fetch')
  async fetchUser(@Req() req) {
    const id = req.user.id;
    // resource-service로 트래픽 넘겨줌
    return await this.clientResourceService.send(
      { cmd: 'fetchBoards' },
      { id },
    );
  }

  // 로그인 api
  @Post('/user/login')
  async login(
    @Body() authLoginInput: AuthLoginInput,
    @Res({ passthrough: true }) res,
  ) {
    // res.send(token);
    const { refreshToken, accessToken } = await lastValueFrom(
      this.clientAuthService.send({ cmd: 'login' }, { authLoginInput }),
    );

    res.cookie('Authentication', refreshToken, {
      domain: 'localhost',
      path: '/',
      httpOnly: true,
    });
    return accessToken;
  }

  // 토큰 재발급 api
  @UseGuards(AuthGuard('refresh'))
  @Post('/user/reissueToken')
  async restoreAccessToken(@Req() req) {
    console.log('req.user:', req.user);

    // console.log('refreshToken:', refreshToken);
    // 리프레시 토큰 쿠키로 보내기

    return await this.clientAuthService.send(
      { cmd: 'restoreAccessToken' },
      { user: req.user },
    );
  }
}
