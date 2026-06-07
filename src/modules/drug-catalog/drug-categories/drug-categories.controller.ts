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
import { DrugCategoriesService } from './drug-categories.service';
import {
  CreateDrugCategoryDto,
  UpdateDrugCategoryDto,
} from '../dto/drug-category.dto';
import { Auth } from '../../../iam/authentication/decorators/auth.decorator';
import { Roles } from '../../../iam/authorization/decorators/roles.decorator';
import { AccountType } from '../../../generated/prisma/enums';
import { AuthType } from '../../../iam/authentication/enums/auth-type.enum';
@Auth(AuthType.Bearer)
@Roles(AccountType.ADMIN, AccountType.MEDICAL_TEAM)
@Controller('drug-categories')
export class DrugCategoriesController {
  constructor(private readonly drugCategoriesService: DrugCategoriesService) {}

  @Post()
  async create(@Body() dto: CreateDrugCategoryDto) {
    return await this.drugCategoriesService.create(dto);
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return await this.drugCategoriesService.findAll(
     parseInt(page || '1', 10),
     parseInt(limit || '10', 10),
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.drugCategoriesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDrugCategoryDto,
  ) {
    return await this.drugCategoriesService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.drugCategoriesService.remove(id);
  }
}