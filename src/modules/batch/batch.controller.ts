import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { BatchService } from './batch.service';
import { CreateSupplierInvoiceItemBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { AddBatchesToSupplierInvoiceDto } from './dto/add-batches-to-supplier-invoice.dto';
import { CurrentPharmacy } from '../../common/decorators/current-pharmacy.decorator';
import { Auth } from '../../iam/authentication/decorators/auth.decorator';
import { AuthType } from '../../iam/authentication/enums/auth-type.enum';
import { Roles } from '../../iam/authorization/decorators/roles.decorator';
import { AccountType } from '../../generated/prisma/enums';
import { AddOpeningStockBatchesDto } from './dto/add-opening-stock-batches.dto';

@Controller('batch')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Post()
  create(@Body() createBatchDto: CreateSupplierInvoiceItemBatchDto) {
    return this.batchService.create(createBatchDto);
  }

  @Get()
  findAll() {
    return this.batchService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.batchService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBatchDto: UpdateBatchDto) {
    return this.batchService.update(+id, updateBatchDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.batchService.remove(+id);
  }

  @Get('pharmacy-drug/:pharmacyDrugId')
  findByPharmacyDrug(
    @CurrentPharmacy() pharmacyId: number,
    @Param('pharmacyDrugId', ParseIntPipe) pharmacyDrugId: number,
  ) {
    return this.batchService.findByPharmacyDrug(pharmacyId, pharmacyDrugId);
  }

  @Roles(AccountType.PHARMACY)
  @Post('opening-stock')
  addOpeningStockBatches(
    @CurrentPharmacy() pharmacyId: number,
    @Body() dto: AddOpeningStockBatchesDto,
  ) {
    return this.batchService.addOpeningStockBatches(pharmacyId, dto);
  }
}
