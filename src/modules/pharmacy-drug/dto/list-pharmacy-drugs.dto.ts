import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { DrugSource } from '../../../generated/prisma/enums';

export class ListPharmacyDrugsDto {
  // البحث بجزء من اسم الدواء
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  @IsString()
  @MaxLength(255)
  name?: string;

  // GENERAL: دواء من قاعدة البيانات المركزية
  // PRIVATE: دواء خاص أضافته الصيدلية
  @IsOptional()
  @IsEnum(DrugSource)
  source?: DrugSource;

  // رقم الصفحة
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  // عدد العناصر في الصفحة الواحدة
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}