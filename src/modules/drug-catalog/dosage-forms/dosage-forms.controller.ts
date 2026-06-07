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
import { DosageFormsService } from './dosage-forms.service';
import {
  CreateDosageFormDto,
  UpdateDosageFormDto,
} from '../dto/dosage-form.dto';
import { Auth } from '../../../iam/authentication/decorators/auth.decorator';
import { Roles } from '../../../iam/authorization/decorators/roles.decorator';
import { AccountType } from '../../../generated/prisma/enums';
import { AuthType } from '../../../iam/authentication/enums/auth-type.enum';
@Auth(AuthType.Bearer)
@Roles(AccountType.ADMIN, AccountType.MEDICAL_TEAM)
@Controller('dosage-forms')
export class DosageFormsController {
  constructor(private readonly dosageFormsService: DosageFormsService) {}

  @Post()
 async create(@Body() dto: CreateDosageFormDto) {
    return await this.dosageFormsService.create(dto);
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return await this.dosageFormsService.findAll(
      parseInt(page || '1', 10),
      parseInt(limit || '10', 10),
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.dosageFormsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDosageFormDto,
  ) {
    return await this.dosageFormsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.dosageFormsService.remove(id);
  }
}