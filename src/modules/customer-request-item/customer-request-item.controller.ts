import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CustomerRequestItemService } from './customer-request-item.service';
import { CreateCustomerRequestItemDto } from './dto/create-customer-request-item.dto';
import { UpdateCustomerRequestItemDto } from './dto/update-customer-request-item.dto';

@Controller('customer-request-item')
export class CustomerRequestItemController {
  constructor(private readonly customerRequestItemService: CustomerRequestItemService) {}

  @Post()
  create(@Body() createCustomerRequestItemDto: CreateCustomerRequestItemDto) {
    return this.customerRequestItemService.create(createCustomerRequestItemDto);
  }

  @Get()
  findAll() {
    return this.customerRequestItemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerRequestItemService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCustomerRequestItemDto: UpdateCustomerRequestItemDto) {
    return this.customerRequestItemService.update(+id, updateCustomerRequestItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerRequestItemService.remove(+id);
  }
}
