import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class ListPharmacyOwnersDto {
  @ApiPropertyOptional({
    example: 'Ahmad',
    description: 'Search by pharmacy owner name',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  @IsString()
  @MaxLength(255)
  name?: string;

  /*
   * يمكن تفعيل البحث برقم الهاتف مستقبلًا
   * عبر إزالة التعليقات من هذا الجزء،
   * ثم إزالة التعليقات من الجزء المقابل داخل Service.
   */

  // @ApiPropertyOptional({
  //   example: '0999999999',
  //   description: 'Search by pharmacy owner phone number',
  // })
  // @IsOptional()
  // @Transform(({ value }: { value: unknown }) =>
  //   typeof value === 'string'
  //     ? value.trim()
  //     : value,
  // )
  // @IsString()
  // @MaxLength(30)
  // phone?: string;

  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: 'Page number',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({
    example: 20,
    default: 20,
    description: 'Number of items per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}