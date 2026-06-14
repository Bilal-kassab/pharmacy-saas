import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { GeneralDrugsService } from './general-drugs.service';
import {
  CreateGeneralDrugDto,
  UpdateGeneralDrugDto,
} from '../dto/general-drug.dto';
import { Auth } from '../../../iam/authentication/decorators/auth.decorator';
import { AuthType } from '../../../iam/authentication/enums/auth-type.enum';
import { AccountType } from '../../../generated/prisma/enums';
import { Roles } from '../../../iam/authorization/decorators/roles.decorator';

@Auth(AuthType.Bearer)
@Roles(AccountType.ADMIN, AccountType.MEDICAL_TEAM)
@Controller('general-drugs')
export class GeneralDrugsController {
  constructor(private readonly generalDrugsService: GeneralDrugsService) {}

  @Post()
  create(@Body() dto: CreateGeneralDrugDto) {
    return this.generalDrugsService.create(dto);
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    // @Query('isActive') isActive?: string,
    // @Query('isRx') isRx?: string,
    // @Query('dosageFormId', new ParseIntPipe({ optional: true }))
    // dosageFormId?: number,
    // @Query('searchTerm') searchTerm?: string,
  ) {
    return this.generalDrugsService.findAll({
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '10', 10),
      // isActive: isActive ? isActive === 'true' : undefined,
      // isRx: isRx ? isRx === 'true' : undefined,
      // dosageFormId,
      // searchTerm,
    });
  }

  @Get('barcode/:barcode')
  async findByBarcode(@Param('barcode') barcode: string) {
    return await this.generalDrugsService.findByBarcode(barcode);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.generalDrugsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGeneralDrugDto,
  ) {
    return await this.generalDrugsService.update(id, dto);
  }

  @Post(':id/deactivate')
  async softDelete(@Param('id', ParseIntPipe) id: number) {
    return await this.generalDrugsService.softDelete(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.generalDrugsService.remove(id);
  }
}