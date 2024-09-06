import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { BoardModule } from './board.module';

// board
async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        BoardModule,
        {
            transport: Transport.TCP,
            options: { host: 'board-service', port: 3003 }, // 게이트웨이와 서비스를 똑같이 입력 네임 리졸루션
        },
    );
    await app.listen();
}
bootstrap();
