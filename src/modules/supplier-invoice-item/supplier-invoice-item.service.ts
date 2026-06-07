import { Injectable } from '@nestjs/common';
import { CreateSupplierInvoiceItemDto } from './dto/create-supplier-invoice-item.dto';
import { UpdateSupplierInvoiceItemDto } from './dto/update-supplier-invoice-item.dto';

@Injectable()
export class SupplierInvoiceItemService {
  create(createSupplierInvoiceItemDto: CreateSupplierInvoiceItemDto) {
    return 'This action adds a new supplierInvoiceItem';
  }

  findAll() {
    return `This action returns all supplierInvoiceItem`;
  }

  findOne(id: number) {
    return `This action returns a #${id} supplierInvoiceItem`;
  }

  update(id: number, updateSupplierInvoiceItemDto: UpdateSupplierInvoiceItemDto) {
    return `This action updates a #${id} supplierInvoiceItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} supplierInvoiceItem`;
  }
}
