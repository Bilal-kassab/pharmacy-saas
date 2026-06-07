// CreateSupplierInvoiceDto
import { Type } from 'class-transformer';
import { IsInt, Min, IsOptional, IsString, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { CreateSupplierInvoiceItemDto } from '../../supplier-invoice-item/dto/create-supplier-invoice-item.dto'; 

export class CreateSupplierInvoiceDto {
  @IsInt()
  @Min(1)
  supplierId: number;

  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @IsOptional()
  @IsDateString()
  invoiceDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSupplierInvoiceItemDto)
  items: CreateSupplierInvoiceItemDto[];
}