import { PartialType } from '@nestjs/swagger';
import { CreateSupplierInvoiceDto } from './create-supplier-invoice.dto';

export class UpdateSupplierInvoiceDto extends PartialType(CreateSupplierInvoiceDto) {}
