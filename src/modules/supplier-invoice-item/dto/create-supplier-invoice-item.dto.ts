// CreateSupplierInvoiceItemDto
import { IsInt, Min, IsOptional, IsString, IsDateString } from 'class-validator';
export class CreateSupplierInvoiceItemDto {
  @IsInt()
  pharmacyDrugId: number;

  @IsInt()
  @Min(1)
  quantityBoxes: number;

  @IsInt()
  @Min(0)
  unitPrice: number;

  @IsOptional()
  @IsString()
  batchNumber?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}