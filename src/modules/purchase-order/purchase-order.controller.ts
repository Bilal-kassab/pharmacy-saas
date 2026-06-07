import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { PurchaseOrderService } from './purchase-order.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { CurrentPharmacy } from '../../common/decorators/current-pharmacy.decorator';
import { Request } from 'express';
import { ActiveUserData } from '../../iam/interfaces/actice-user-data.interface';
import { AccountType } from '../../generated/prisma/enums';
import { Roles } from '../../iam/authorization/decorators/roles.decorator';
import { PurchaseOrderFilterDto } from './dto/create-purchase-order-filter.dto';

type RequestWithUser = Request & {
  user?: ActiveUserData;
};
@Controller('purchase-order')
export class PurchaseOrderController {
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  @Roles(AccountType.PHARMACY)
  @Post('create')
  create(
    @CurrentPharmacy() pharmacyId: number,
    @Body() dto: CreatePurchaseOrderDto,
  ) {
    return this.purchaseOrderService.create(pharmacyId, dto);
  }

  @Roles(AccountType.PHARMACY)
  @Get()
  findAll(
    @CurrentPharmacy() pharmacyId: number,
    @Query() filters: PurchaseOrderFilterDto,
  ) {
    return this.purchaseOrderService.findAll(pharmacyId, filters);
  }
  
  @Get('test')
  test(@Req() req: RequestWithUser) {
    return {
      pharmacyId: req.user.sub,
    };
  }
}
