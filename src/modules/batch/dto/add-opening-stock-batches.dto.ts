import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class OpeningStockBatchItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pharmacyDrugId: number;

  @IsOptional()
  @IsString()
  batchNumber?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  initialQuantity: number;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsDateString()
  receivedDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AddOpeningStockBatchesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OpeningStockBatchItemDto)
  batches: OpeningStockBatchItemDto[];
}