import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

// api-gateway

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true, //여기에 url을 넣어도된다.
    credentials: true,
  });
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
