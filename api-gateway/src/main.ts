import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

// api-gateway

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true, //여기에 url을 넣어도된다.
    // credentials: true,
    // allowedHeaders: ['Content-Type', 'Authorization'],
    // origin: 'http://127.0.0.1:5500', // 클라이언트의 실제 URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
