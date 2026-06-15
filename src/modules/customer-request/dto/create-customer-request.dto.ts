import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import { CreateCustomerRequestItemDto } from '../../customer-request-item/dto/create-customer-request-item.dto';

export class CreateCustomerRequestDto {
  @IsString()
  @MaxLength(200)
  customerName: string;

  @IsOptional()
  @IsString()
  @IsPhoneNumber('SY')
  @MaxLength(30)
  customerPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => CreateCustomerRequestItemDto)
  items: CreateCustomerRequestItemDto[];
}
