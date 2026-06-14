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

@Injectable()
export class CustomerRequestService {
  constructor(private readonly prisma: PrismaService) {}

  async create(pharmacyId: number, dto: CreateCustomerRequestDto) {
    return this.prisma.$transaction(async (tx) => {
      const drugIds = dto.items.map((item) => item.pharmacyDrugId);

      const uniqueDrugIds = new Set(drugIds);

      if (drugIds.length !== uniqueDrugIds.size) {
        throw new BadRequestException(
          'Duplicate drugs are not allowed in the same request',
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
          items: true,
        },
      });

      return request;
    });
  }

  async findAll(pharmacyId: number, query: GetCustomerRequestsDto) {
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
        where.createdAt.gte = query.fromDate;
      }

      if (query.toDate) {
        where.createdAt.lte = query.toDate;
      }
    }

    if (query.pharmacyDrugId) {
      where.items = {
        some: {
          pharmacyDrugId: query.pharmacyDrugId,
        },
      };
    }

    return this.prisma.customerRequest.findMany({
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

      skip: ((query.page ?? 1) - 1) * (query.limit ?? 20),

      take: query.limit ?? 20,
    });
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
