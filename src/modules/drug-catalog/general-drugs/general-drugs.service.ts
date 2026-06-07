import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  CreateGeneralDrugDto,
  DrugIngredientInputDto,
  UpdateGeneralDrugDto,
} from '../dto/general-drug.dto';
import { DrugSource, Prisma } from '../../../generated/prisma/client';

@Injectable()
export class GeneralDrugsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations = {
    dosageForm: true,
    ingredients: {
      include: {
        ingredient: true,
      },
    },
    categories: {
      include: {
        category: true,
      },
    },
  } satisfies Prisma.GeneralDrugInclude;

  async create(dto: CreateGeneralDrugDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        await this.ensureDosageFormExists(dto.dosageFormId, tx);
        await this.ensureIngredientsExist(dto.ingredients, tx);
        await this.ensureCategoriesExist(dto.categoryIds, tx);

        return tx.generalDrug.create({
          data: {
            // dosageFormId: dto.dosageFormId,
            drug: {
              create: {
                source: DrugSource.GENERAL,
              },
            },
            dosageForm: {
              connect: {
                dosageFormId: dto.dosageFormId,
              },
            },
            tradeName: dto.tradeName,
            barcode: dto.barcode,
            unitsPerBox: dto.unitsPerBox,
            netPrice: dto.netPrice,
            consumerPrice: dto.consumerPrice,
            isRx: dto.isRx ?? false,
            isActive: dto.isActive ?? true,

            ingredients: {
              create: dto.ingredients.map((item) => ({
                ingredientId: item.ingredientId,
                strengthValue: item.strengthValue,
                unit: item.unit,
              })),
            },

            categories: {
              create: dto.categoryIds.map((categoryId) => ({
                categoryId,
              })),
            },
          },
          include: this.includeRelations,
        });
      });
    } catch (error) {
      if ((error as any).code === 'P2002') {
        throw new ConflictException(
          'Barcode, ingredient assignment, or category assignment already exists',
        );
      }

      throw error;
    }
  }

  async findAll() {
    return this.prisma.generalDrug.findMany({
      include: this.includeRelations,
      orderBy: {
        tradeName: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const drug = await this.prisma.generalDrug.findUnique({
      where: {
        generalDrugId: id,
      },
      include: this.includeRelations,
    });

    if (!drug) {
      throw new NotFoundException('General drug not found');
    }

    return drug;
  }

  async findByBarcode(barcode: string) {
    const drug = await this.prisma.generalDrug.findUnique({
      where: {
        barcode,
      },
      include: this.includeRelations,
    });

    if (!drug) {
      throw new NotFoundException('Drug with this barcode was not found');
    }

    return drug;
  }

  async update(id: number, dto: UpdateGeneralDrugDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const existingDrug = await tx.generalDrug.findUnique({
          where: {
            generalDrugId: id,
          },
        });

        if (!existingDrug) {
          throw new NotFoundException('General drug not found');
        }

        if (dto.dosageFormId !== undefined) {
          await this.ensureDosageFormExists(dto.dosageFormId, tx);
        }

        if (dto.ingredients !== undefined) {
          await this.ensureIngredientsExist(dto.ingredients, tx);

          await tx.drugIngredient.deleteMany({
            where: {
              generalDrugId: id,
            },
          });

          if (dto.ingredients.length > 0) {
            await tx.drugIngredient.createMany({
              data: dto.ingredients.map((item) => ({
                generalDrugId: id,
                ingredientId: item.ingredientId,
                strengthValue: item.strengthValue,
                unit: item.unit,
              })),
            });
          }
        }

        if (dto.categoryIds !== undefined) {
          await this.ensureCategoriesExist(dto.categoryIds, tx);

          await tx.drugCategoryAssignment.deleteMany({
            where: {
              generalDrugId: id,
            },
          });

          if (dto.categoryIds.length > 0) {
            await tx.drugCategoryAssignment.createMany({
              data: dto.categoryIds.map((categoryId) => ({
                generalDrugId: id,
                categoryId,
              })),
            });
          }
        }

        const updatedDrug = await tx.generalDrug.update({
          where: {
            generalDrugId: id,
          },
          data: {
            dosageFormId: dto.dosageFormId,
            tradeName: dto.tradeName,
            barcode: dto.barcode,
            unitsPerBox: dto.unitsPerBox,
            netPrice: dto.netPrice,
            consumerPrice: dto.consumerPrice,
            isRx: dto.isRx,
            isActive: dto.isActive,
          },
          include: this.includeRelations,
        });

        return updatedDrug;
      });
    } catch (error) {
      if ((error as any).code === 'P2002') {
        throw new ConflictException(
          'Barcode, ingredient assignment, or category assignment already exists',
        );
      }

      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.generalDrug.delete({
      where: {
        generalDrugId: id,
      },
    });

    return {
      message: 'General drug deleted successfully',
    };
  }

  private async ensureDosageFormExists(
    dosageFormId: number,
    prismaClient: Prisma.TransactionClient,
  ) {
    const dosageForm = await prismaClient.dosageForm.findUnique({
      where: {
        dosageFormId,
      },
    });

    if (!dosageForm) {
      throw new BadRequestException('Invalid dosageFormId');
    }
  }

  private async ensureIngredientsExist(
    ingredients: DrugIngredientInputDto[],
    prismaClient: Prisma.TransactionClient,
  ) {
    const ingredientIds = ingredients.map((item) => item.ingredientId);

    this.ensureNoDuplicateNumbers(
      ingredientIds,
      'Duplicate ingredientId found',
    );

    const existingIngredients = await prismaClient.activeIngredient.findMany({
      where: {
        ingredientId: {
          in: ingredientIds,
        },
      },
      select: {
        ingredientId: true,
      },
    });

    if (existingIngredients.length !== ingredientIds.length) {
      throw new BadRequestException('One or more ingredientIds are invalid');
    }
  }

  private async ensureCategoriesExist(
    categoryIds: number[],
    prismaClient: Prisma.TransactionClient,
  ) {
    this.ensureNoDuplicateNumbers(categoryIds, 'Duplicate categoryId found');

    const existingCategories = await prismaClient.drugCategory.findMany({
      where: {
        categoryId: {
          in: categoryIds,
        },
      },
      select: {
        categoryId: true,
      },
    });

    if (existingCategories.length !== categoryIds.length) {
      throw new BadRequestException('One or more categoryIds are invalid');
    }
  }

  private ensureNoDuplicateNumbers(values: number[], message: string) {
    const uniqueValues = new Set(values);

    if (uniqueValues.size !== values.length) {
      throw new BadRequestException(message);
    }
  }
}
