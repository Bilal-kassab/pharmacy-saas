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
import { CustomerRequestService } from './customer-request.service';
import { CreateCustomerRequestDto } from './dto/create-customer-request.dto';
import { UpdateCustomerRequestDto } from './dto/update-customer-request.dto';
import { CurrentPharmacy } from '../../common/decorators/current-pharmacy.decorator';
import { GetCustomerRequestsDto } from './dto/get-customer-request.dto';
import { Auth } from '../../iam/authentication/decorators/auth.decorator';
import { AuthType } from '../../iam/authentication/enums/auth-type.enum';
import { Roles } from '../../iam/authorization/decorators/roles.decorator';
import { AccountType } from '../../generated/prisma/enums';

@Controller('customer-request')
export class CustomerRequestController {
  constructor(
    private readonly customerRequestService: CustomerRequestService,
  ) {}

  @Roles(AccountType.PHARMACY)
  @Post('create')
  create(
    @CurrentPharmacy() pharmacyId: number,
    @Body() createCustomerRequestDto: CreateCustomerRequestDto,
  ) {
    return this.customerRequestService.create(
      pharmacyId,
      createCustomerRequestDto,
    );
  }

  @Get()
  findAll(
    @CurrentPharmacy() pharmacyId: number,
    @Query() query: GetCustomerRequestsDto,
  ) {
    return this.customerRequestService.findAll(pharmacyId, query);
  }

  @Get(':id')
  findOne(
    @CurrentPharmacy() pharmacyId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.customerRequestService.findOne(pharmacyId, id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerRequestDto: UpdateCustomerRequestDto,
  ) {
    return this.customerRequestService.update(+id, updateCustomerRequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerRequestService.remove(+id);
  }
}
