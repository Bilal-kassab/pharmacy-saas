import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';

export class AddSupplierInvoiceBatchItemDto {
  @IsInt()
  supplierInvoiceItemId: number;

  @IsInt()
  @Min(1)
  initialQuantity: number;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}

export class AddBatchesToSupplierInvoiceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddSupplierInvoiceBatchItemDto)
  batches: AddSupplierInvoiceBatchItemDto[];
}
