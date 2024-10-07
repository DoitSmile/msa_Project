import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor() {
    super({
      jwtFromRequest: (req: Request) => {
        const cookie = req.cookies['refreshToken'];
        if (!cookie) {
          throw new UnauthorizedException('Refresh token not found');
        }
        return cookie;
      },
      secretOrKey: '리프레시비밀번호',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.cookies['refreshToken'];
    // 여기에서 refreshToken의 유효성을 추가로 검사할 수 있습니다.
    // 예: 데이터베이스에서 해당 refreshToken이 유효한지 확인

    return {
      email: payload.email,
      id: payload.sub,
    };
  }
}