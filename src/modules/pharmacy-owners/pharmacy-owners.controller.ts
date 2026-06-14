import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PharmacyOwnersService } from './pharmacy-owners.service';
import { CreatePharmacyOwnerDto } from './dto/create-pharmacy-owner.dto';
import { UpdatePharmacyOwnerDto } from './dto/update-pharmacy-owner.dto';
import { Roles } from '../../iam/authorization/decorators/roles.decorator';
import { AccountType } from '../../generated/prisma/browser';
import { ListPharmacyOwnersDto } from './dto/list-pharmacy-owners.dto';

@Controller('pharmacy-owners')
export class PharmacyOwnersController {
  constructor(private readonly pharmacyOwnersService: PharmacyOwnersService) {}

  @Post()
  create(@Body() createPharmacyOwnerDto: CreatePharmacyOwnerDto) {
    return this.pharmacyOwnersService.create(createPharmacyOwnerDto);
  }

  @Get()
  // @Roles(AccountType.ADMIN)
  findAll(
    @Query() dto: ListPharmacyOwnersDto,
  ) {
    return this.pharmacyOwnersService.findAll(dto);
  }

  @Get(':id')
  @Roles(AccountType.ADMIN)
  findOne(
    @Param('id') id: string,
  ) {
    return this.pharmacyOwnersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePharmacyOwnerDto: UpdatePharmacyOwnerDto) {
    return this.pharmacyOwnersService.update(+id, updatePharmacyOwnerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pharmacyOwnersService.remove(+id);
  }
}
