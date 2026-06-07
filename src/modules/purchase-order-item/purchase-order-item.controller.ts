import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PurchaseOrderItemService } from './purchase-order-item.service';
import { CreatePurchaseOrderItemDto } from './dto/create-purchase-order-item.dto';
import { UpdatePurchaseOrderItemDto } from './dto/update-purchase-order-item.dto';

@Controller('purchase-order-item')
export class PurchaseOrderItemController {
  constructor(private readonly purchaseOrderItemService: PurchaseOrderItemService) {}

  @Post()
  create(@Body() createPurchaseOrderItemDto: CreatePurchaseOrderItemDto) {
    return this.purchaseOrderItemService.create(createPurchaseOrderItemDto);
  }

  @Get()
  findAll() {
    return this.purchaseOrderItemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseOrderItemService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePurchaseOrderItemDto: UpdatePurchaseOrderItemDto) {
    return this.purchaseOrderItemService.update(+id, updatePurchaseOrderItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.purchaseOrderItemService.remove(+id);
  }
}
