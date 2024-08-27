import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

// auth
async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: { host: 'auth-service', port: 3001 }, // 게이트웨이와 서비스를 똑같이 입력 네임 리졸루션
    },
  );
  await app.listen();
}
bootstrap();
