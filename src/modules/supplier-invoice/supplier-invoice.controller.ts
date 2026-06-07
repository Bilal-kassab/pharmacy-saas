import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SupplierInvoiceService } from './supplier-invoice.service';
import { CreateSupplierInvoiceDto } from './dto/create-supplier-invoice.dto';
import { UpdateSupplierInvoiceDto } from './dto/update-supplier-invoice.dto';
import { CurrentPharmacy } from '../../common/decorators/current-pharmacy.decorator';

@Controller('supplier-invoice')
export class SupplierInvoiceController {
  constructor(private readonly supplierInvoiceService: SupplierInvoiceService) {}

  @Get()
  findAll() {
    return this.supplierInvoiceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.supplierInvoiceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSupplierInvoiceDto: UpdateSupplierInvoiceDto) {
    return this.supplierInvoiceService.update(+id, updateSupplierInvoiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.supplierInvoiceService.remove(+id);
  }

  // @Post('create')
  // create(@CurrentPharmacy() pharmacyId: number, @Body() dto: CreateSupplierInvoiceDto) {
  //   return this.supplierInvoiceService.create(pharmacyId, dto);
  // }
}
