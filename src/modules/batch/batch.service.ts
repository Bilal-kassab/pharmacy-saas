import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSupplierInvoiceItemBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { AddBatchesToSupplierInvoiceDto } from './dto/add-batches-to-supplier-invoice.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BatchService {
  constructor(private readonly prisma: PrismaService) {}

  create(createBatchDto: CreateSupplierInvoiceItemBatchDto) {
    return 'This action adds a new batch';
  }

  findAll() {
    return `This action returns all batch`;
  }

  findOne(id: number) {
    return `This action returns a #${id} batch`;
  }

  update(id: number, updateBatchDto: UpdateBatchDto) {
    return `This action updates a #${id} batch`;
  }

  remove(id: number) {
    return `This action removes a #${id} batch`;
  }

  async addBatchesToInvoice(
    pharmacyId: number,
    supplierInvoiceId: number,
    dto: AddBatchesToSupplierInvoiceDto,
  ) {
    if (!Array.isArray(dto.batches) || dto.batches.length === 0) {
      throw new BadRequestException('batches must be a non-empty array');
    }

    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.supplierInvoice.findFirst({
        where: {
          supplierInvoiceId,
          supplier: {
            pharmacyId,
          },
        },
        include: {
          items: {
            include: {
              batches: true,
            },
          },
        },
      });

      if (!invoice) {
        throw new NotFoundException('Supplier invoice not found');
      }

      // uncomment after editing prisma schema to include status
      // if (invoice.status === 'STOCKED') {
      //   throw new BadRequestException('Invoice is already stocked');
      // }

      const itemIds = invoice.items.map((item) => item.supplierInvoiceItemId);

      for (const batchDto of dto.batches) {
        if (!itemIds.includes(batchDto.supplierInvoiceItemId)) {
          throw new BadRequestException(
            `Invalid supplierInvoiceItemId: ${batchDto.supplierInvoiceItemId}`,
          );
        }

        const invoiceItem = invoice.items.find(
          (item) =>
            item.supplierInvoiceItemId === batchDto.supplierInvoiceItemId,
        );

        const alreadyBatchedQuantity = invoiceItem.batches.reduce(
          (sum, batch) => sum + batch.initialQuantity,
          0,
        );

        if (
          alreadyBatchedQuantity + batchDto.initialQuantity >
          invoiceItem.quantity
        ) {
          throw new BadRequestException(
            `Batch quantity exceeds invoice item quantity for item ${batchDto.supplierInvoiceItemId}`,
          );
        }

        await tx.batch.create({
          data: {
            pharmacyDrugId: invoiceItem.pharmacyDrugId,
            supplierInvoiceItemId: invoiceItem.supplierInvoiceItemId,
            initialQuantity: batchDto.initialQuantity,
            expiryDate: batchDto.expiryDate
              ? new Date(batchDto.expiryDate)
              : undefined,
            receivedDate: invoice.invoiceDate,
          },
        });
      }

      const updatedInvoice = await tx.supplierInvoice.findFirst({
        where: { supplierInvoiceId },
        include: {
          items: {
            include: {
              batches: true,
            },
          },
        },
      });

      const isFullyStocked = updatedInvoice.items.every((item) => {
        const totalBatched = item.batches.reduce(
          (sum, batch) => sum + batch.initialQuantity,
          0,
        );

        return totalBatched === item.quantity;
      });

      return tx.supplierInvoice.update({
        where: { supplierInvoiceId },
        data: {
          // status: isFullyStocked ? 'STOCKED' : 'PENDING',
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
    });
  }

  async findByPharmacyDrug(pharmacyId: number, pharmacyDrugId: number) {
    const batches = await this.prisma.batch.findMany({
      where: {
        pharmacyDrugId,
        pharmacyDrug: {
          pharmacyId,
        },
      },
      include: {
        pharmacyDrug: true,
        supplierInvoiceItem: {
          include: {
            supplierInvoice: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return batches;
  }
}
