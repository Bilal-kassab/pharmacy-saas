import { Module } from '@nestjs/common';
import { SupplierInvoiceService } from './supplier-invoice.service';
import { SupplierInvoiceController } from './supplier-invoice.controller';

@Module({
  controllers: [SupplierInvoiceController],
  providers: [SupplierInvoiceService],
})
export class SupplierInvoiceModule {}
