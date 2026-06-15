import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateCustomerRequestItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pharmacyDrugId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  requestedQuantity: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
