import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { CurrentPharmacy } from '../../common/decorators/current-pharmacy.decorator';

@Controller('supplier')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post('create')
  create(
    @CurrentPharmacy() pharmacyId: number,
    @Body() dto: Omit<CreateSupplierDto, 'pharmacyId'>,
  ) {
    return this.supplierService.create({
      ...dto,
      pharmacyId,
    });
  }

  @Get()
  findAll() {
    return this.supplierService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.supplierService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.supplierService.update(+id, updateSupplierDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.supplierService.remove(+id);
  }
}
