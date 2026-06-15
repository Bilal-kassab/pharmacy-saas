import { Module } from '@nestjs/common';
import { CustomerRequestService } from './customer-request.service';
import { CustomerRequestController } from './customer-request.controller';

@Module({
  controllers: [CustomerRequestController],
  providers: [CustomerRequestService],
})
export class CustomerRequestModule {}
