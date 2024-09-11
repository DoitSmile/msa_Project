import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AuthModule } from './auth.module';
import * as cookieParser from 'cookie-parser';

// auth
async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    {
      transport: Transport.TCP,
      options: { host: 'auth-service', port: 3001 }, // 게이트웨이와 서비스를 똑같이 입력 네임 리졸루션
    },
  );
  // app.use(cookieParser());
  await app.listen();
}
bootstrap();
