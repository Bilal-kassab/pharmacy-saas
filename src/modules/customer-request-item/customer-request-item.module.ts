import { Module } from '@nestjs/common';
import { CustomerRequestItemService } from './customer-request-item.service';
import { CustomerRequestItemController } from './customer-request-item.controller';

@Module({
  controllers: [CustomerRequestItemController],
  providers: [CustomerRequestItemService],
})
export class CustomerRequestItemModule {}
