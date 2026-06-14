import { PartialType } from '@nestjs/swagger';
import { CreateCustomerRequestDto } from './create-customer-request.dto';

export class UpdateCustomerRequestDto extends PartialType(CreateCustomerRequestDto) {}
