// jwt-refresh.strategy.ts

import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor() {
    super({
      jwtFromRequest: (req) => {
        // console.log(req);
        const cookie = req.headers.cookie;
        //req.headers.cookie: 미들웨어(cookie-paser)를 사용하지 않는 경우에도 쿠키에 접근할 수 있습니다.
        const refreshToken = cookie.replace('Authentication=', '');
        return refreshToken;
      },
      secretOrKey: '리프레시비밀번호',
    });
  }

  validate(payload) {
    console.log(payload); // { sub: asdkljfkdj(유저ID) }

    return {
      email: payload.email,
      //   id: payload.sub,
    };
  }
}
