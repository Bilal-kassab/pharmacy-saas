import { Module } from '@nestjs/common';
import { SupplierInvoiceService } from './supplier-invoice.service';
import { SupplierInvoiceController } from './supplier-invoice.controller';
import { BatchModule } from '../batch/batch.module';

@Module({
  imports: [BatchModule],
  controllers: [SupplierInvoiceController],
  providers: [SupplierInvoiceService],
})
export class SupplierInvoiceModule {}
