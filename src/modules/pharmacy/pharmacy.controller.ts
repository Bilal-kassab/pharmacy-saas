import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { CreatePharmacyAccountDto } from './dto/create-pharmacy-account.dto';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { Auth } from '../../iam/authentication/decorators/auth.decorator';
import { AuthType } from '../../iam/authentication/enums/auth-type.enum';

import { ChangePharmacyStatusDto } from './dto/change-pharmacy-status.dto';
import { Roles } from '../../iam/authorization/decorators/roles.decorator';
import { AccountType } from '../../generated/prisma/enums';

@ApiTags('Pharmacy')
@Controller('pharmacy')
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  // @Auth(AuthType.None)
  @Roles(AccountType.ADMIN)
  @Post('create')
  @ResponseMessage('Pharmacy account created successfully')
  @ApiOperation({
    summary: 'Create pharmacy account with new or existing owner',
  })
  @ApiCreatedResponse({
    description: 'Pharmacy account created successfully.',
  })
  createPharmacyAccount(@Body() dto: CreatePharmacyAccountDto) {
    return this.pharmacyService.createPharmacyAccount(dto);
  }

  // @Auth(AuthType.None)
  // @Roles(AccountType.ADMIN)
  @Patch(':id/status')
  @Roles(AccountType.ADMIN)
  @ResponseMessage('Pharmacy status changed successfully')
  changeStatus(@Param('id') id: string, @Body() dto: ChangePharmacyStatusDto) {
    return this.pharmacyService.changeStatus(+id, dto);
  }
}
