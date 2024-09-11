import { NestFactory } from '@nestjs/core';
import {  UserModule } from './user.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

// resource
async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    {
      transport: Transport.TCP,
      options: { host: 'user-service', port: 3002 },
    },
  );
  await app.listen();
}
bootstrap();
