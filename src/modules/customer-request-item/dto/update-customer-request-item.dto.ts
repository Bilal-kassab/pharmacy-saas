import { PartialType } from '@nestjs/swagger';
import { CreateCustomerRequestItemDto } from './create-customer-request-item.dto';

export class UpdateCustomerRequestItemDto extends PartialType(CreateCustomerRequestItemDto) {}
