import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SupplierInvoiceItemService } from './supplier-invoice-item.service';
import { CreateSupplierInvoiceItemDto } from './dto/create-supplier-invoice-item.dto';
import { UpdateSupplierInvoiceItemDto } from './dto/update-supplier-invoice-item.dto';

@Controller('supplier-invoice-item')
export class SupplierInvoiceItemController {
  constructor(private readonly supplierInvoiceItemService: SupplierInvoiceItemService) {}

  @Post()
  create(@Body() createSupplierInvoiceItemDto: CreateSupplierInvoiceItemDto) {
    return this.supplierInvoiceItemService.create(createSupplierInvoiceItemDto);
  }

  @Get()
  findAll() {
    return this.supplierInvoiceItemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.supplierInvoiceItemService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSupplierInvoiceItemDto: UpdateSupplierInvoiceItemDto) {
    return this.supplierInvoiceItemService.update(+id, updateSupplierInvoiceItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.supplierInvoiceItemService.remove(+id);
  }
}
