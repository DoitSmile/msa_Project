import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import 'dotenv/config';

// UseGuards : 로그인을 한 유저면  API를 실행시키고
// 로그인을 하지 않은 유저면 fetchUser API가 실행되지 못하게할 방어막
// 아래는 'access'라는 이름을 가진 Guard이다.

export class JWtAccessStrategy extends PassportStrategy(Strategy, 'access') {
  //PassportStrategy(인가를처리할방식,설정한인증방식이름)
  constructor() {
    const ACCESS_TOKEN_KEY = process.env.ACCESS_TOKEN_KEY;
    console.log('ACCESS_TOKEN_KEY:', ACCESS_TOKEN_KEY);
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //jwtFromRequest로 헤더에 존재하는 jwtToken을 가져옴 (fromAuthHeaderAsBearerToken())

      secretOrKey: ACCESS_TOKEN_KEY,
    });
  }
  // fromAuthHeaderAsBearerToken()함수 사용하지 않고 토큰 직접 뽑아오는 법
  // jwtFromRequest: (req) => {
  //   console.log(req);
  //   const temp = req.headers.Authorization;
  //   const accessToken = temp.toLowercase().replace('bearer ', '');
  //   return accessToken;
  // },

  //검증에 성공(인가에 성공)한다면 payload를 열어서 사용자의 정보를 반환
  async validate(payload) {
    return {
      id: payload.id,
    };
  }
  // return : fetchUser API로 return 되는 것이 아님
  //  req에 user라는 이름으로 email과 id 정보가 담긴 객체를 user 안으로 return되는 것(passport에서 user를 자동으로 만들어 주기에, 바꿀 수 없다).
}
