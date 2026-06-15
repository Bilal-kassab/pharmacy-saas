import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSupplierInvoiceDto } from './dto/create-supplier-invoice.dto';
import { UpdateSupplierInvoiceDto } from './dto/update-supplier-invoice.dto';
import { Prisma, SupplierInvoiceStatus } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SupplierInvoiceFilterDto } from './dto/create-supplier-invoice-filter.dto';

@Injectable()
export class SupplierInvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(pharmacyId: number, dto: CreateSupplierInvoiceDto) {
    if (!Array.isArray(dto.items) || dto.items.length === 0) {
      throw new BadRequestException('items must be a non-empty array');
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. verify supplier belongs to pharmacy
      await this.assertSupplierBelongsToPharmacy(
        dto.supplierId,
        pharmacyId,
        tx,
      );

      // 2. verify all pharmacyDrugIds belong to pharmacy
      await this.assertPharmacyDrugsBelongToPharmacy(
        dto.items.map((i) => i.pharmacyDrugId),
        pharmacyId,
        tx,
      );

      // 3. compute amounts
      const computedItems = dto.items.map((it) => {
        const qty = Number(it.quantity);
        const netUnitPrice = Number(it.netUnitPrice);
        const totalPrice = Number((qty * netUnitPrice).toFixed(2));
        return { ...it, quantity: qty, netUnitPrice, totalPrice };
      });

      const subtotal = computedItems.reduce((s, it) => s + it.totalPrice, 0);
      const discount = dto.discount ? Number(dto.discount) : 0;
      const totalPrice = Number((subtotal - discount).toFixed(2));

      const invoiceDate = dto.invoiceDate
        ? new Date(dto.invoiceDate)
        : new Date();

      // 4. create supplierInvoice with nested items
      const created = await tx.supplierInvoice.create({
        data: {
          supplierId: dto.supplierId,
          invoiceNumber: dto.invoiceNumber ?? undefined,
          invoiceDate,
          subtotal,
          discount,
          totalPrice,
          notes: dto.notes ?? undefined,
          status: SupplierInvoiceStatus.PENDING,
          items: {
            create: computedItems.map((it) => ({
              pharmacyDrug: { connect: { pharmacyDrugId: it.pharmacyDrugId } },
              quantity: it.quantity,
              netUnitPrice: it.netUnitPrice,
              totalPrice: it.totalPrice,
              notes: it.notes ?? undefined,
            })),
          },
        },
        include: { items: true },
      });

      // 5. Create Batches if they were provided (Scenario 1: Immedite Batches)
      const batchesToCreate: Prisma.BatchCreateManyInput[] = [];

      for (let i = 0; i < computedItems.length; i++) {
        const itemInput = computedItems[i];
        const createdItem = created.items[i];

        if (itemInput.batches && itemInput.batches.length > 0) {
          for (const batch of itemInput.batches) {
            batchesToCreate.push({
              pharmacyDrugId: itemInput.pharmacyDrugId,
              supplierInvoiceItemId: createdItem.supplierInvoiceItemId,
              expiryDate: batch.expiryDate ? new Date(batch.expiryDate) : null,
              initialQuantity: batch.initialQuantity ?? itemInput.quantity,
              receivedDate: invoiceDate,
              // batchNumber: batch.batchNumber, // Add this if you have it in Batch schema
            });
          }
        }
      }

      if (batchesToCreate.length > 0) {
        await tx.batch.createMany({
          data: batchesToCreate,
        });

        // Optionally update the invoice status to APPROVED or PARTIALLY_RECEIVED here
        // if all quantities mathced what was ordered.
      }

      // Return the fully populated invoice
      return tx.supplierInvoice.findUnique({
        where: { supplierInvoiceId: created.supplierInvoiceId },
        include: { items: { include: { batches: true } } },
      });
    });
  }

  // async create(pharmacyId: number, dto: CreateSupplierInvoiceDto) {
  //   if (!Array.isArray(dto.items) || dto.items.length === 0) {
  //     throw new BadRequestException('items must be a non-empty array');
  //   }

  //   return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
  //     await this.assertSupplierBelongsToPharmacy(
  //       dto.supplierId,
  //       pharmacyId,
  //       tx,
  //     );

  //     await this.assertPharmacyDrugsBelongToPharmacy(
  //       dto.items.map((item) => item.pharmacyDrugId),
  //       pharmacyId,
  //       tx,
  //     );

  //     const computedItems = dto.items.map((item) => {
  //       const quantity = Number(item.quantity);
  //       const netUnitPrice = Number(item.netUnitPrice);
  //       const totalPrice = Number((quantity * netUnitPrice).toFixed(2));

  //       if (quantity <= 0) {
  //         throw new BadRequestException(
  //           `quantity must be greater than 0 for pharmacyDrugId ${item.pharmacyDrugId}`,
  //         );
  //       }

  //       if (netUnitPrice < 0) {
  //         throw new BadRequestException(
  //           `netUnitPrice must not be negative for pharmacyDrugId ${item.pharmacyDrugId}`,
  //         );
  //       }

  //       return {
  //         pharmacyDrugId: item.pharmacyDrugId,
  //         quantity,
  //         netUnitPrice,
  //         totalPrice,
  //         notes: item.notes,
  //       };
  //     });

  //     const subtotal = computedItems.reduce(
  //       (sum, item) => sum + item.totalPrice,
  //       0,
  //     );

  //     const discount = dto.discount ? Number(dto.discount) : 0;

  //     if (discount < 0) {
  //       throw new BadRequestException('discount must not be negative');
  //     }

  //     if (discount > subtotal) {
  //       throw new BadRequestException(
  //         'discount must not be greater than subtotal',
  //       );
  //     }

  //     const totalPrice = Number((subtotal - discount).toFixed(2));

  //     const invoiceDate = dto.invoiceDate
  //       ? new Date(dto.invoiceDate)
  //       : new Date();

  //     return tx.supplierInvoice.create({
  //       data: {
  //         supplierId: dto.supplierId,
  //         invoiceNumber: dto.invoiceNumber ?? undefined,
  //         invoiceDate,
  //         subtotal,
  //         discount,
  //         totalPrice,
  //         notes: dto.notes ?? undefined,
  //         status: SupplierInvoiceStatus.PENDING,

  //         items: {
  //           create: computedItems.map((item) => ({
  //             pharmacyDrug: {
  //               connect: {
  //                 pharmacyDrugId: item.pharmacyDrugId,
  //               },
  //             },
  //             quantity: item.quantity,
  //             netUnitPrice: item.netUnitPrice,
  //             totalPrice: item.totalPrice,
  //             notes: item.notes ?? undefined,
  //           })),
  //         },
  //       },
  //       include: {
  //         supplier: true,
  //         items: {
  //           include: {
  //             pharmacyDrug: true,
  //             batches: true,
  //           },
  //         },
  //       },
  //     });
  //   });
  // }

  private async assertSupplierBelongsToPharmacy(
    supplierId: number,
    pharmacyId: number,
    tx: Prisma.TransactionClient,
  ) {
    const s = await tx.supplier.findFirst({
      where: { supplierId, pharmacyId },
      select: { supplierId: true },
    });
    if (!s) throw new BadRequestException('Invalid supplier for this pharmacy');
    return s;
  }

  private async assertPharmacyDrugsBelongToPharmacy(
    pharmacyDrugIds: number[],
    pharmacyId: number,
    tx: Prisma.TransactionClient,
  ) {
    const ids = Array.from(new Set(pharmacyDrugIds));
    const found = await tx.pharmacyDrug.findMany({
      where: { pharmacyDrugId: { in: ids }, pharmacyId },
      select: { pharmacyDrugId: true },
    });
    if (found.length !== ids.length) {
      throw new BadRequestException(
        'One or more pharmacyDrugId values are invalid for this pharmacy',
      );
    }
    return found;
  }

  async findAll(pharmacyId: number, filters: SupplierInvoiceFilterDto) {
    const {
      supplierId,
      status,
      paymentStatus,
      invoiceNumber,
      fromDate,
      toDate,
    } = filters;

    return this.prisma.supplierInvoice.findMany({
      where: {
        supplier: {
          pharmacyId,
          ...(supplierId !== undefined ? { supplierId } : {}),
        },
        ...(status !== undefined ? { status } : {}),
        ...(paymentStatus !== undefined ? { paymentStatus } : {}),
        ...(invoiceNumber
          ? { invoiceNumber: { contains: invoiceNumber, mode: 'insensitive' } }
          : {}),
        ...(fromDate || toDate
          ? {
              invoiceDate: {
                ...(fromDate ? { gte: new Date(fromDate) } : {}),
                ...(toDate ? { lte: new Date(toDate) } : {}),
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
    const invoice = await this.prisma.supplierInvoice.findFirst({
      where: {
        supplierInvoiceId: id,
        supplier: {
          pharmacyId,
        },
      },
      include: {
        supplier: true,
        items: {
          include: {
            pharmacyDrug: true,
            batches: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Supplier invoice not found');
    }

    return invoice;
  }
}
