import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}
  // @Get이나 @Post 같은 Rest-API의 Method가 아닌
  // MessagePattern 을 통해 gateway에서 각각의 API로 요청을 전달합니다.

  // 회원가입
  @MessagePattern({ cmd: 'createUser' })
  async createUser(data) {
    //데이터 생성, 회원가입 진행

    return await this.userService.createUser(data.createUserInput);
  }

  @MessagePattern({ cmd: 'fetchUser' })
  async fetchUser(data) {
    return await this.userService.fetchUser(data.userId);
  }

  @MessagePattern({ cmd: 'updateUser' })
  async updateUser(data) {
    console.log('Update user data:', data);
    return await this.userService.updateUser(data.userId, data.updateData);
  }

  @MessagePattern({ cmd: 'updateUserWithProfilePicture' })
  async updateUserWithProfilePicture(data) {
    console.log('Update user with profile picture data:', data);
    return await this.userService.updateUser(data.userId, data.updateData);
  }

  // 회원비밀번호수정
  @MessagePattern({ cmd: 'updateUserPassword' })
  async updateUserPassword(data) {
    console.log('updateUserPassword data:', data);
    return await this.userService.updateUserPassword(
      data.userId,
      data.updatePasswordInput,
    );
  }

  // 회원 탈퇴
  @MessagePattern({ cmd: 'deleteUser' })
  async deleteUser(data) {
    console.log('data:', data);
    return await this.userService.updateUser(data.userId, data.password);
  }

  // 핸드폰 인증 발송
  @MessagePattern({ cmd: 'sendPhone' })
  async sendPhone(data) {
    return await this.userService.sendPhone(data.phone_num);
  }

  // 핸드폰 인증 확인
  @MessagePattern({ cmd: 'checkValidPhone' })
  async checkValidPhone(data) {
    return await this.userService.checkValidPhone(data.authPhoneInput);
  }

  @MessagePattern({ cmd: 'checkEmail' })
  async checkEmail(data: { email: string }) {
    const isAvailable = await this.userService.checkEmailAvailability(
      data.email,
    );
    return { available: isAvailable };
  }

  @MessagePattern({ cmd: 'checkName' })
  async checkName(data: { name: string }) {
    const isAvailable = await this.userService.checkNameAvailability(data.name);
    return { available: isAvailable };
  }
}
