import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { CreatePurchaseOrderItemDto } from '../purchase-order-item/dto/create-purchase-order-item.dto';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PurchaseOrderFilterDto } from './dto/create-purchase-order-filter.dto';

@Injectable()
export class PurchaseOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(pharmacyId: number, dto: CreatePurchaseOrderDto) {
    if (!dto.items?.length) {
      throw new BadRequestException(
        'Purchase order must contain at least one item',
      );
    }
    return await this.prisma.$transaction(async (tx) => {
      await Promise.all([
        this.assertSupplierBelongsToPharmacy(dto.supplierId, pharmacyId, tx),
        this.assertDrugsBelongToPharmacy(dto.items, pharmacyId, tx),
      ]);

      return tx.purchaseOrder.create({
        data: {
          pharmacyId,
          supplierId: dto.supplierId,
          notes: dto.notes,
          items: {
            create: dto.items.map((item) => ({
              pharmacyDrugId: item.pharmacyDrugId,
              orderedQuantityBoxes: item.orderedQuantityBoxes,
              notes: item.notes,
            })),
          },
        },
        include: {
          items: true,
        },
      });
    });
  }
  private async assertSupplierBelongsToPharmacy(
    supplierId: number,
    pharmacyId: number,
    tx: Prisma.TransactionClient,
  ) {
    const supplier = await tx.supplier.findFirst({
      where: { supplierId, pharmacyId },
      select: { supplierId: true },
    });

    if (!supplier) {
      throw new BadRequestException('Invalid supplierId for this pharmacy');
    }
  }

  private async assertDrugsBelongToPharmacy(
    items: CreatePurchaseOrderItemDto[],
    pharmacyId: number,
    tx: Prisma.TransactionClient,
  ) {
    const uniqueDrugIds = [
      ...new Set(items.map((item) => item.pharmacyDrugId)),
    ];

    const pharmacyDrugs = await tx.pharmacyDrug.findMany({
      where: {
        pharmacyDrugId: { in: uniqueDrugIds },
        pharmacyId,
      },
      select: { pharmacyDrugId: true },
    });

    if (pharmacyDrugs.length !== uniqueDrugIds.length) {
      throw new BadRequestException(
        'One or more pharmacyDrugId values are invalid for this pharmacy',
      );
    }
  }

  async findAll(pharmacyId: number, filters: PurchaseOrderFilterDto) {
    const { supplierId, pharmacyDrugId } = filters;

    return this.prisma.purchaseOrder.findMany({
      where: {
        pharmacyId,
        ...(supplierId !== undefined ? { supplierId } : {}),
        ...(pharmacyDrugId !== undefined
          ? {
              items: {
                some: {
                  pharmacyDrugId,
                },
              },
            }
          : {}),
      },
      include: {
        supplier: true,
        items: {
          include: {
            pharmacyDrug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(pharmacyId: number, id: number) {
    const po = await this.prisma.purchaseOrder.findFirst({
      where: {
        purchaseOrderId: id,
        pharmacyId,
      },
      include: {
        supplier: true,
        items: {
          include: {
            pharmacyDrug: {
              include: {
                drug: true, // اختياري: تفاصيل الـ drug إذا احتجت
              },
            },
          },
        },
      },
    });

    if (!po) throw new NotFoundException('Purchase order not found');
    return po;
  }
}
