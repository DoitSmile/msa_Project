import { ConflictException, Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@shared/entites/user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PhoneAuthentication } from './checkphone';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    // private readonly authphone: PhoneAuthentication,
    private readonly jwtService: JwtService, // jwt 관련 비지니스로직 사용가능.
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authPhone: PhoneAuthentication,
  ) {}

  private verificationCodes: Map<string, { code: string }> = new Map();

  // 이메일로 유저 찾기
  async findEmail({ email }) {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  // 로그인
  async login(data) {
    // 이메일이 일치하는 user를 db에서 가져옴
    const { email, password } = data;
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

  // 로그아웃
  async logout(id) {
    console.log('logout id', id);
    await this.cacheManager.del(`refresh_token:${id}`);
  }

  // 토큰 발급
  async getAccessToken({ user }) {
    console.log('user.id', user.id);
    console.log('user.name', user.name);
    const test = this.jwtService.sign(
      { id: user.id, name: user.name }, //payload엔 보여줘도 되는 값만 입력
      { secret: '나의비밀번호', expiresIn: '10m' },
    ); // return 타입: 발급받은 토큰

    return test;
  }

  // 리프레시 토큰 발급
  async setRefreshToken({ user }) {
    const test = await this.jwtService.sign(
      { id: user.id },
      { secret: '리프레시비밀번호', expiresIn: '1w' },
    );
    // await this.cacheManager.set(
    //   `refresh_token:${user.id}`,
    //   test,
    //   7 * 24 * 60 * 60, // 1주일
    // );
    return test;
  }

  // cookie에 refreshToken이 저장되어 있으면 @UseGuards(AuthGuard('refresh'))를 통과하고 발급 가능 .
  // 토큰 재발급
  async restoreAccessToken({ user }) {
    // const redisToken = await this.cacheManager.get(`refresh_token:${user.id}`);
    // if (redisToken === refreshToken) {
    return this.getAccessToken({ user });
    // } else {
    //   throw new ConflictException('다시 로그인해주세요');
    // }
  }

  // 핸드폰 인증번호 전송.
  async sendPhone(phone_num: string): Promise<any> {
    const checkValid = await this.authPhone.checkphone(phone_num);
    if (!checkValid) throw new ConflictException('유효하지 않은 핸드폰 번호');
    const myToken = await this.authPhone.getToken();
    // const expiry = Date.now() + 300000; // 5분 후 만료
    // console.log('expiry:', expiry);
    // await this.authPhone.sendTokenToSMS(phone, mytoken); 실제 전송
    const set = this.verificationCodes.set(phone_num, {
      code: myToken,
    }); // 인증번호 임시저장하기
    console.log('set:', set);
    return set;
  }

  // 핸드폰 인증번호 확인
  async checkValidPhone(authPhoneInput): Promise<any> {
    const storedData = this.verificationCodes.get(authPhoneInput.phone_num);
    if (storedData.code === authPhoneInput.auth_num) {
      return '인증완료';
    } else {
      throw new ConflictException('인증실패');
    }
  }
}
