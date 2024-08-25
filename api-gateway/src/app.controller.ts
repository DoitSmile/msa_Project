import { Controller, Get, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
// import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly clientAuthService: ClientProxy,
    @Inject('RESOURCE_SERVICE')
    private readonly clientResourceService: ClientProxy,
  ) {}

  @Post('/user/create')
  CreateUser() {
    // auth-service로 트래픽 넘겨줌
    const test = this.clientResourceService.send(
      // return : 브라우저로 보내줌
      { cmd: 'createUser' }, // cmd:xx 넘길 패턴 이름
      { email: 'a@a.com', password: '1234' }, //넘길 data
    );
    console.log('test:', test);
    return test;
    // `cmd`에는 앞서 각각의 API에서 작성했던 메세지 패턴을 적습니다.
    //API에 넘겨줄 데이터 값이 있다면 두번째 인자로 정할 수 있습니다. 넘겨줄 데이터 값이 없을 경우 빈 객체`{}`로 작성합니다.
  }

  @Get('/boards')
  fetchBoards() {
    // resource-service로 트래픽 넘겨줌
    return this.clientResourceService.send({ cmd: 'fetchBoards' }, {});
  }
}
