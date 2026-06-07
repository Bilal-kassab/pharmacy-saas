import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { CreatePurchaseOrderItemDto } from '../../purchase-order-item/dto/create-purchase-order-item.dto';

export class CreatePurchaseOrderDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  supplierId: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  items: CreatePurchaseOrderItemDto[];
}