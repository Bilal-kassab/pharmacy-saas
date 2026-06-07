import { Module } from '@nestjs/common';
import { PurchaseOrderItemService } from './purchase-order-item.service';
import { PurchaseOrderItemController } from './purchase-order-item.controller';

@Module({
  controllers: [PurchaseOrderItemController],
  providers: [PurchaseOrderItemService],
})
export class PurchaseOrderItemModule {}
