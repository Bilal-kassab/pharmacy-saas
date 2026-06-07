import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export class CreateSupplierDto {
  @IsInt()
  @Type(() => Number)
  @Min(1)
  pharmacyId!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  supplierName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}