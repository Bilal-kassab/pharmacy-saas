import { Module } from '@nestjs/common';
import { BatchService } from './batch.service';
import { BatchController } from './batch.controller';

@Module({
  exports: [BatchService],
  controllers: [BatchController],
  providers: [BatchService],
})
export class BatchModule {}
