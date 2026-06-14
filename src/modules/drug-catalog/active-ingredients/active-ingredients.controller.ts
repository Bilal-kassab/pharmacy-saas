import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Auth } from '../../../iam/authentication/decorators/auth.decorator';
import { AuthType } from '../../../iam/authentication/enums/auth-type.enum';
import { Roles } from '../../../iam/authorization/decorators/roles.decorator';
import { AccountType } from '../../../generated/prisma/enums';
import { ActiveIngredientsService } from './active-ingredients.service';
import {
  CreateActiveIngredientDto,
  UpdateActiveIngredientDto,
} from '../dto/active-ingredient.dto';

@Auth(AuthType.Bearer)
@Roles(AccountType.ADMIN, AccountType.MEDICAL_TEAM)
@Controller('active-ingredients')
export class ActiveIngredientsController {
  constructor(
    private readonly activeIngredientsService: ActiveIngredientsService,
  ) {}

  @Post()
 async create(@Body() dto: CreateActiveIngredientDto) {
    return await this.activeIngredientsService.create(dto);
  }

  @Get()
  async findAll() {
    return await this.activeIngredientsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.activeIngredientsService.findOne(id);
  }

  // @Post(':id')
  // async update(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() dto: UpdateActiveIngredientDto,
  // ) {
  //   return await this.activeIngredientsService.update(id, dto);
  // }

  // @Post(':id')
  // async remove(@Param('id', ParseIntPipe) id: number) {
  //   return await this.activeIngredientsService.remove(id);
  // }
}
