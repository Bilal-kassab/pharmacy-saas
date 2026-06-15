import { PartialType } from '@nestjs/swagger';
import { CreateSupplierInvoiceItemBatchDto } from './create-batch.dto';

export class UpdateBatchDto extends PartialType(CreateSupplierInvoiceItemBatchDto) {}
