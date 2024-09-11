// jwt-refresh.strategy.ts

import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

// UseGuards : 로그인을 한 유저면  API를 실행시키고
// 로그인을 하지 않은 유저면 fetchUser API가 실행되지 못하게할 방어막
// 아래는 'refresh'라는 이름을 가진 Guard이다.
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor() {
    super({
      jwtFromRequest: (req) => {
        const cookie = req.headers.cookie;
        console.log('조합 cookie:', cookie);
        const refreshToken = cookie.replace('refreshToken=', '');
        return refreshToken;
      },
      secretOrKey: '리프레시비밀번호',
      //검증 과정에서 다음을 확인합니다:
      //a) 토큰의 서명이 유효한지 (secretOrKey를 사용하여 확인)
      //b) 토큰이 만료되지 않았는지
      //c) 토큰의 형식이 올바른지
    });
  }

  validate(payload) {
    console.log(payload); // { sub: asdkljfkdj(유저ID) }

    return {
      id: payload.id,
    };
  }
}
