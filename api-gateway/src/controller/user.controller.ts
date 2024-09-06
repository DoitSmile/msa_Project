import { Body, Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserInput } from '../dto/userdto/create-user.input.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class UserController {
  constructor(
    @Inject('USER_SERVICE')
    private readonly clientUserService: ClientProxy,
  ) {}
  // ---------------------------- user  ----------------------------

  // 회원가입
  @Post('/user/create')
  async createUser(@Body() createUserInput: CreateUserInput) {
    console.log('createUserInput:', createUserInput);
    return await this.clientUserService.send(
      // return : 브라우저로 보내줌
      { cmd: 'createUser' }, // cmd:xx 넘길 패턴 이름
      { createUserInput }, //넘길 data
    );

    // `cmd`에는 앞서 각각의 API에서 작성했던 메세지 패턴을 적습니다.
    // API에 넘겨줄 데이터 값이 있다면, 두 번째 인자로 정할 수 있습니다. 넘겨줄 데이터 값이 없을 경우 빈 객체`{}`로 작성합니다.
  }

  // 회원조회
  @UseGuards(AuthGuard('access')) // UseGuards- > 로그인을 한 유저면 api 실행
  @Post('/user/fetch')
  async fetchUser(@Req() req) {
    const id = req.user.id;
    console.log(' app / id:', id);
    // user-service로 트래픽(데이터) 넘겨줌
    return await this.clientUserService.send(
      { cmd: 'fetchUser' },
      { id: req.user.id },
    );
  }
}
