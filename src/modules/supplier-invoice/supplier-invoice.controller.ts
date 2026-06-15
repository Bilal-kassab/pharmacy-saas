import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { SupplierInvoiceService } from './supplier-invoice.service';
import { CreateSupplierInvoiceDto } from './dto/create-supplier-invoice.dto';
import { UpdateSupplierInvoiceDto } from './dto/update-supplier-invoice.dto';
import { CurrentPharmacy } from '../../common/decorators/current-pharmacy.decorator';
import { Roles } from '../../iam/authorization/decorators/roles.decorator';
import { AccountType } from '../../generated/prisma/enums';
import { SupplierInvoiceFilterDto } from './dto/create-supplier-invoice-filter.dto';
import { BatchService } from '../batch/batch.service';
import { AddBatchesToSupplierInvoiceDto } from '../batch/dto/add-batches-to-supplier-invoice.dto';
import { Auth } from '../../iam/authentication/decorators/auth.decorator';
import { AuthType } from '../../iam/authentication/enums/auth-type.enum';

@Controller('supplier-invoice')
export class SupplierInvoiceController {
  constructor(
    private readonly supplierInvoiceService: SupplierInvoiceService,
    private readonly batchService: BatchService,
  ) {}

  @Post('create')
  create(
    @CurrentPharmacy() pharmacyId: number,
    @Body() dto: CreateSupplierInvoiceDto,
  ) {
    return this.supplierInvoiceService.create(pharmacyId, dto);
  }

  @Roles(AccountType.PHARMACY)
  @Get()
  findAll(
    @CurrentPharmacy() pharmacyId: number,
    @Query() filters: SupplierInvoiceFilterDto,
  ) {
    return this.supplierInvoiceService.findAll(pharmacyId, filters);
  }

  @Roles(AccountType.PHARMACY)
  @Get(':id')
  findOne(
    @CurrentPharmacy() pharmacyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.supplierInvoiceService.findOne(pharmacyId, id);
  }

  @Roles(AccountType.PHARMACY)
  @Post(':id/batches')
  addBatchesToInvoice(
    @CurrentPharmacy() pharmacyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddBatchesToSupplierInvoiceDto,
  ) {
    return this.batchService.addBatchesToInvoice(pharmacyId, id, dto);
  }
}
