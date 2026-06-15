import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerRequestDto } from './dto/create-customer-request.dto';
import { UpdateCustomerRequestDto } from './dto/update-customer-request.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { GetCustomerRequestsDto } from './dto/get-customer-request.dto';
import { Prisma } from '../../generated/prisma/client';
import {
  getPaginationParams,
  toPaginatedResult,
} from '../../common/pagination/pagination.util';

@Injectable()
export class CustomerRequestService {
  constructor(private readonly prisma: PrismaService) {}

  async create(pharmacyId: number, dto: CreateCustomerRequestDto) {
    if (!Array.isArray(dto.items) || dto.items.length === 0) {
      throw new BadRequestException('items must be a non-empty array');
    }

    return this.prisma.$transaction(async (tx) => {
      const pharmacyDrugIds = dto.items.map((item) => item.pharmacyDrugId);

      const uniquePharmacyDrugIds = [...new Set(pharmacyDrugIds)];

      if (pharmacyDrugIds.length !== uniquePharmacyDrugIds.length) {
        throw new BadRequestException(
          'Duplicate drugs are not allowed in the same request',
        );
      }

      for (const item of dto.items) {
        if (!item.pharmacyDrugId) {
          throw new BadRequestException('pharmacyDrugId is required');
        }

        if (!item.requestedQuantity || item.requestedQuantity <= 0) {
          throw new BadRequestException(
            `requestedQuantity must be greater than 0 for pharmacyDrugId ${item.pharmacyDrugId}`,
          );
        }
      }

      const existingPharmacyDrugs = await tx.pharmacyDrug.findMany({
        where: {
          pharmacyId,
          pharmacyDrugId: {
            in: uniquePharmacyDrugIds,
          },
        },
        select: {
          pharmacyDrugId: true,
        },
      });

      if (existingPharmacyDrugs.length !== uniquePharmacyDrugIds.length) {
        const existingIds = new Set(
          existingPharmacyDrugs.map((drug) => drug.pharmacyDrugId),
        );

        const invalidIds = uniquePharmacyDrugIds.filter(
          (id) => !existingIds.has(id),
        );

        throw new BadRequestException(
          `Invalid pharmacyDrugId values for this pharmacy: ${invalidIds.join(
            ', ',
          )}`,
        );
      }

      const request = await tx.customerRequest.create({
        data: {
          pharmacyId,
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          notes: dto.notes,

          items: {
            create: dto.items.map((item) => ({
              pharmacyDrugId: item.pharmacyDrugId,
              requestedQuantity: item.requestedQuantity,
            })),
          },
        },
        include: {
          items: {
            include: {
              pharmacyDrug: true,
            },
          },
        },
      });

      return request;
    });
  }

  async findAll(pharmacyId: number, query: GetCustomerRequestsDto) {
    const { page, limit, skip, take } = getPaginationParams(
      query.page,
      query.limit,
    );

    const where: Prisma.CustomerRequestWhereInput = {
      pharmacyId,
    };

    if (
      query.fromDate &&
      query.toDate &&
      new Date(query.fromDate) > new Date(query.toDate)
    ) {
      throw new BadRequestException('fromDate must be before toDate');
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        {
          customerName: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          customerPhone: {
            contains: query.search,
          },
        },
      ];
    }

    if (query.fromDate || query.toDate) {
      where.createdAt = {};

      if (query.fromDate) {
        where.createdAt.gte = new Date(query.fromDate);
      }

      if (query.toDate) {
        where.createdAt.lte = new Date(query.toDate);
      }
    }

    if (query.pharmacyDrugId) {
      where.items = {
        some: {
          pharmacyDrugId: query.pharmacyDrugId,
        },
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.customerRequest.findMany({
        where,
        include: {
          items: {
            include: {
              pharmacyDrug: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),

      this.prisma.customerRequest.count({
        where,
      }),
    ]);

    return toPaginatedResult(items, total, page, limit);
  }

  async findOne(pharmacyId: number, customerRequestId: number) {
    const request = await this.prisma.customerRequest.findFirst({
      where: {
        customerRequestId,
        pharmacyId,
      },

      include: {
        items: {
          include: {
            pharmacyDrug: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Customer request not found');
    }

    return request;
  }

  update(id: number, updateCustomerRequestDto: UpdateCustomerRequestDto) {
    return `This action updates a #${id} customerRequest`;
  }

  remove(id: number) {
    return `This action removes a #${id} customerRequest`;
  }
}
