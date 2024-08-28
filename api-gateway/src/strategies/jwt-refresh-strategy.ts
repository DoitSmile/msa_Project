// jwt-refresh.strategy.ts

import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor() {
    super({
      jwtFromRequest: (req) => {
        console.log(req);
        const cookie = req.headers.cookie;
        console.log('cookie:', cookie);
        const refreshToken = cookie.replace('Authentication=', '');
        return refreshToken;
      },
      secretOrKey: '리프레시비밀번호',
    });
  }

  validate(payload) {
    console.log(payload); // { sub: asdkljfkdj(유저ID) }

    return {
      id: payload.sub,
    };
  }
}
