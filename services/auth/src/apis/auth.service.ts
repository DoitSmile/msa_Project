import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IAuthLoginInput } from '@shared/interfaces/auth/auth-service.interface';
import * as bcrypt from 'bcrypt';
import { User } from '@shared/entites/user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    // private readonly authphone: PhoneAuthentication,
    private readonly jwtService: JwtService, // jwt 관련 비지니스로직 사용가능
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 이메일로 유저 찾기
  async findEmail({ email }) {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  // 로그인
  async login(data) {
    // 이메일이 일치하는 user를 db에서 가져옴
    const { email, password } = data.authLoginInput;
    const user = await this.findEmail({ email });
    const isAuth = await bcrypt.compare(password, user.password);
    if (isAuth && user) {
      const refreshToken = await this.setRefreshToken({ user });
      const accessToken = await this.getAccessToken({ user });
      return { refreshToken, accessToken }; // refresh token과 기존 token을 각각 cookie, payload에 따로 저장하고 보안 높이기
    } else {
      throw new ConflictException('로그인 실패');
    }
  }

  // 토큰 발급
  async getAccessToken({ user }) {
    console.log('user.id', user.id);
    const test = this.jwtService.sign(
      { id: user.id }, //payload엔 보여줘도 되는 값만 입력
      { secret: '나의비밀번호', expiresIn: '10m' },
    ); // return 타입: 발급받은 토큰

    return test;
  }

  // 리프레시 토큰 발급
  async setRefreshToken({ user }) {
    const test = await this.jwtService.sign(
      { id: user.id },
      { secret: '리프레시비밀번호', expiresIn: '2w' },
    );
    return test;
  }

  // 토큰 재발급
  restoreAccessToken({ user }) {
    return this.getAccessToken({ user });
  }
}
