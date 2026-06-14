import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class AddPrivateDrugDto {
  @IsInt()
  @IsPositive()
  dosageFormId: number;

  @IsString()
  @MaxLength(255)
  tradeName: string;

  @IsString()
  @MaxLength(255)
  barcode: string;

  @IsInt()
  @IsPositive()
  unitsPerBox: number;

  @IsOptional()
  @IsBoolean()
  isRx?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  minStockAlert?: number;

  @IsOptional()
  @IsBoolean()
  sellPart?: boolean;

  @IsOptional()
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  netPrice?: number;

  @IsOptional()
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  consumerPrice?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  storageLocation?: string;
}