import { Type } from 'class-transformer';

import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { CustomerRequestStatus } from '../../../generated/prisma/enums';
import { PaginationQueryDto } from '../../../common/pagination/pagination-query.dto';

export class GetCustomerRequestsDto extends PaginationQueryDto{
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pharmacyDrugId?: number;

  @IsOptional()
  @IsEnum(CustomerRequestStatus)
  status?: CustomerRequestStatus;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  // @IsOptional()
  // @Type(() => Number)
  // @IsInt()
  // @Min(1)
  // page: number = 1;

  // @IsOptional()
  // @Type(() => Number)
  // @IsInt()
  // @Min(1)
  // @Max(100)
  // limit: number = 20;
}
