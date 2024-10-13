import {
  Body,
  Controller,
  Inject,
  Post,
  Req,
  Param,
  UseGuards,
  Get,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserInput } from '../dto/userdto/create-user.input.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserInput } from 'src/dto/userdto/update-user.input.dto';
import { UpdatePasswordInput } from 'src/dto/userdto/update-userpassword.input.dto';

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
  @Get('/user/fetch/:id')
  async fetchUser(@Param('id') userId) {
    // user-service로 트래픽(데이터) 넘겨줌
    return await this.clientUserService.send({ cmd: 'fetchUser' }, { userId });
  }

  // 회원수정
  @UseGuards(AuthGuard('access')) // UseGuards- > 로그인을 한 유저면 api 실행
  @Post('/user/update/:id')
  async updateUser(
    @Body() updateUserInput: UpdateUserInput,
    @Param('id') userId,
  ) {
    console.log(' update app / id:', userId);
    console.log('updateUserInput:', updateUserInput);
    // user-service로 트래픽(데이터) 넘겨줌
    return await this.clientUserService.send(
      { cmd: 'updateUser' },
      { userId, updateUserInput },
    );
  }

  // 비밀번호 수정
  @UseGuards(AuthGuard('access')) // UseGuards- > 로그인을 한 유저면 api 실행
  @Post('/user/update/password/:id')
  async updateUserPassword(
    @Body() updatePasswordInput: UpdatePasswordInput,
    @Param('id') userId,
  ) {
    console.log(' updateUserPassword id:', userId);
    console.log(' updatePasswordInput:', updatePasswordInput);
    // user-service로 트래픽(데이터) 넘겨줌
    return await this.clientUserService.send(
      { cmd: 'updateUserPassword' },
      { userId, updatePasswordInput },
    );
  }

  // 회원 탈퇴
  @UseGuards(AuthGuard('access')) // UseGuards- > 로그인을 한 유저면 api 실행
  @Post('/user/delete/:id')
  async deleteUser(@Body() password, @Param('id') userId) {
    console.log(' delete id:', userId);
    console.log(' password:', password);
    // user-service로 트래픽(데이터) 넘겨줌
    return await this.clientUserService.send(
      { cmd: 'deleteUser' },
      { userId, password },
    );
  }
  // // 핸드폰 인증번호 발송 api
  // @Post('/user/sendPhone')
  // async sendPhone(@Body('qqq') qqq: string, @Res() res): Promise<void> {
  //   const myphone = qqq;
  //   const result = await this.authService.sendPhone(myphone);
  //   res.send(result);
  // }

  // // 핸드폰 인증번호 확인 로직 api
  // @Post('/user/checkPhone')
  // async checkValidPhone(@Body('qqq') qqq: string, @Res() res): Promise<void> {
  //   const in_num = qqq;
  //   const result = await this.authService.checkValidPhone(in_num);
  //   res.send(result);
  // }
}
