import { IsOptional, IsString } from 'class-validator';

export class SupplierFilterDto {
  @IsOptional()
  @IsString()
  searchQuery?: string;
}