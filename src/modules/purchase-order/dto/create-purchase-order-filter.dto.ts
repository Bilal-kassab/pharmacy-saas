import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PurchaseOrderFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  supplierId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pharmacyDrugId?: number;
}