import { Type } from 'class-transformer';
import { IsInt, Min, IsOptional, IsString } from 'class-validator';

export class CreatePurchaseOrderItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  orderedQuantityBoxes: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  pharmacyDrugId: number;

  @IsOptional()
  @IsString()
  notes?: string;
}