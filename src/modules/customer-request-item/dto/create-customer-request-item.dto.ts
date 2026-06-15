import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateCustomerRequestItemDto {
  @IsInt()
  @Min(1)
  pharmacyDrugId: number;

  @IsInt()
  @Min(1)
  requestedQuantity: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
