import { Module } from '@nestjs/common';
import { SupplierInvoiceItemService } from './supplier-invoice-item.service';
import { SupplierInvoiceItemController } from './supplier-invoice-item.controller';

@Module({
  controllers: [SupplierInvoiceItemController],
  providers: [SupplierInvoiceItemService],
})
export class SupplierInvoiceItemModule {}
