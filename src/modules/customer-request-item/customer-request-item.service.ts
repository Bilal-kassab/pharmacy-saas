import { Injectable } from '@nestjs/common';
import { CreateCustomerRequestItemDto } from './dto/create-customer-request-item.dto';
import { UpdateCustomerRequestItemDto } from './dto/update-customer-request-item.dto';

@Injectable()
export class CustomerRequestItemService {
  create(createCustomerRequestItemDto: CreateCustomerRequestItemDto) {
    return 'This action adds a new customerRequestItem';
  }

  findAll() {
    return `This action returns all customerRequestItem`;
  }

  findOne(id: number) {
    return `This action returns a #${id} customerRequestItem`;
  }

  update(id: number, updateCustomerRequestItemDto: UpdateCustomerRequestItemDto) {
    return `This action updates a #${id} customerRequestItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} customerRequestItem`;
  }
}
