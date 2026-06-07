import { PartialType } from '@nestjs/swagger';
import { CreateSupplierInvoiceItemDto } from './create-supplier-invoice-item.dto';

export class UpdateSupplierInvoiceItemDto extends PartialType(CreateSupplierInvoiceItemDto) {}
