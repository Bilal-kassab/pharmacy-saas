import { PartialType } from '@nestjs/swagger';
import { CreatePurchaseOrderItemDto } from './create-purchase-order-item.dto';

export class UpdatePurchaseOrderItemDto extends PartialType(CreatePurchaseOrderItemDto) {}
