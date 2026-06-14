import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  CreateDrugCategoryDto,
  UpdateDrugCategoryDto,
} from '../dto/drug-category.dto';

@Injectable()
export class DrugCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDrugCategoryDto) {
    try {
      return await this.prisma.drugCategory.create({
        data: {
          categoryName: dto.categoryName,
          description: dto.description,
        },
      });
    } catch (error) {
      if ((error as any).code === 'P2002') {
        throw new ConflictException('Drug category already exists');
      }

      throw error;
    }
  }

  async findAll(
    page: number,
    limit: number,
  ) {

    const skip = (page - 1) * limit;

    const [drugs, total] = await Promise.all([
      this.prisma.drugCategory.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.drugCategory.count(),
    ]);
    const pages = Math.ceil(total / limit);
    const hasNextPage = page < pages;
    const hasPreviousPage = page > 1;

    return {
      data: drugs,
      page,
      limit,
      total,
      pages,
      hasNextPage,
      hasPreviousPage,
    };
    // return this.prisma.drugCategory.findMany({
    //   orderBy: {
    //     categoryName: 'asc',
    //   },
    //   // skip: (page - 1) * limit,
    //   // take: limit,
    // });
  }

  async findOne(id: number) {
    const category = await this.prisma.drugCategory.findUnique({
      where: {
        categoryId: id,
      },
    });

    if (!category) {
      throw new NotFoundException('Drug category not found');
    }

    return category;
  }

  async update(id: number, dto: UpdateDrugCategoryDto) {
    await this.findOne(id);

    try {
      return await this.prisma.drugCategory.update({
        where: {
          categoryId: id,
        },
        data: dto,
      });
    } catch (error) {
      if ((error as any).code === 'P2002') {
        throw new ConflictException('Drug category already exists');
      }

      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.drugCategory.delete({
      where: {
        categoryId: id,
      },
    });

    return {
      message: 'Drug category deleted successfully',
    };
  }
}