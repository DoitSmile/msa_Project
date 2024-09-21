import { Module } from '@nestjs/common';
import { AppController } from './apis/point.controller';
import { AppService } from './apis/point.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
