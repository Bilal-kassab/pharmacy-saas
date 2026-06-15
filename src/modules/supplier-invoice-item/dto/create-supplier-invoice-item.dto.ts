// CreateSupplierInvoiceItemDto
import { Type } from 'class-transformer';
import {
  IsInt,
  Min,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { CreateSupplierInvoiceItemBatchDto } from '../../batch/dto/create-batch.dto';

// export class CreateSupplierInvoiceItemDto {
//   @IsInt()
//   pharmacyDrugId: number;

//   @IsInt()
//   @Min(1)
//   quantityBoxes: number;

//   @IsInt()
//   @Min(0)
//   unitPrice: number;

//   @IsOptional()
//   @IsString()
//   batchNumber?: string;

//   @IsOptional()
//   @IsDateString()
//   expiryDate?: string;

//   @IsOptional()
//   @IsString()
//   notes?: string;
// }

export class CreateSupplierInvoiceItemDto {
  @IsInt()
  @Min(1)
  pharmacyDrugId: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'netUnitPrice must be a number' })
  @Min(0)
  netUnitPrice: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSupplierInvoiceItemBatchDto)
  batches?: CreateSupplierInvoiceItemBatchDto[];
}
