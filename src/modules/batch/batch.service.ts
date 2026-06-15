import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AddBatchesToSupplierInvoiceDto } from './dto/add-batches-to-supplier-invoice.dto';
import { AddOpeningStockBatchesDto } from './dto/add-opening-stock-batches.dto';
import { CreateSupplierInvoiceItemBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';

type SupplierInvoiceForStocking = Prisma.SupplierInvoiceGetPayload<{
  include: {
    items: {
      include: {
        batches: true;
      };
    };
  };
}>;

type SupplierInvoiceWithDetails = Prisma.SupplierInvoiceGetPayload<{
  include: {
    supplier: true;
    items: {
      include: {
        pharmacyDrug: true;
        batches: true;
      };
    };
  };
}>;

type SupplierInvoiceItemForStocking =
  SupplierInvoiceForStocking['items'][number];

type InvoiceItemsById = Map<number, SupplierInvoiceItemForStocking>;

type OpeningStockBatch = Prisma.BatchGetPayload<{
  include: {
    pharmacyDrug: true;
  };
}>;

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
  ): Promise<SupplierInvoiceWithDetails> {
    this.validateBatchesPayload(dto.batches);

    return this.prisma.$transaction(async (tx) => {
      const invoice = await this.findSupplierInvoiceForStockingOrThrow(
        tx,
        pharmacyId,
        supplierInvoiceId,
      );

      const invoiceItemsById = this.buildInvoiceItemsMap(invoice.items);

      this.validateRequestedBatchQuantities(dto, invoiceItemsById);

      await this.createInvoiceBatches(tx, dto, invoice, invoiceItemsById);

      return this.findSupplierInvoiceWithDetailsOrThrow(
        tx,
        pharmacyId,
        supplierInvoiceId,
      );
    });
  }

  async findByPharmacyDrug(pharmacyId: number, pharmacyDrugId: number) {
    return this.prisma.batch.findMany({
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
  }

  async addOpeningStockBatches(
    pharmacyId: number,
    dto: AddOpeningStockBatchesDto,
  ): Promise<OpeningStockBatch[]> {
    this.validateBatchesPayload(dto.batches);
    this.validateOpeningStockQuantities(dto);

    return this.prisma.$transaction(async (tx) => {
      await this.ensureAllPharmacyDrugsBelongToPharmacy(tx, pharmacyId, dto);

      const createdBatches: OpeningStockBatch[] = [];

      for (const batchDto of dto.batches) {
        const createdBatch = await tx.batch.create({
          data: {
            pharmacyDrugId: batchDto.pharmacyDrugId,
            supplierInvoiceItemId: null,
            initialQuantity: batchDto.initialQuantity,
            soldQuantity: 0,
            expiryDate: batchDto.expiryDate
              ? new Date(batchDto.expiryDate)
              : undefined,
            receivedDate: batchDto.receivedDate
              ? new Date(batchDto.receivedDate)
              : new Date(),
          },
          include: {
            pharmacyDrug: true,
          },
        });

        createdBatches.push(createdBatch);
      }

      return createdBatches;
    });
  }

  private validateBatchesPayload(batches: unknown): void {
    if (!Array.isArray(batches) || batches.length === 0) {
      throw new BadRequestException('batches must be a non-empty array');
    }
  }

  private async findSupplierInvoiceForStockingOrThrow(
    tx: Prisma.TransactionClient,
    pharmacyId: number,
    supplierInvoiceId: number,
  ): Promise<SupplierInvoiceForStocking> {
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

    if (invoice.status === 'REJECTED') {
      throw new BadRequestException('Rejected invoice cannot be stocked');
    }

    return invoice;
  }

  private async findSupplierInvoiceWithDetailsOrThrow(
    tx: Prisma.TransactionClient,
    pharmacyId: number,
    supplierInvoiceId: number,
  ): Promise<SupplierInvoiceWithDetails> {
    const invoice = await tx.supplierInvoice.findFirst({
      where: {
        supplierInvoiceId,
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

  private buildInvoiceItemsMap(
    items: SupplierInvoiceItemForStocking[],
  ): InvoiceItemsById {
    return new Map(
      items.map((item) => [item.supplierInvoiceItemId, item]),
    );
  }

  private validateRequestedBatchQuantities(
    dto: AddBatchesToSupplierInvoiceDto,
    invoiceItemsById: InvoiceItemsById,
  ): void {
    const requestedQuantityByItem = new Map<number, number>();

    for (const batchDto of dto.batches) {
      if (batchDto.initialQuantity <= 0) {
        throw new BadRequestException(
          `initialQuantity must be greater than 0 for item ${batchDto.supplierInvoiceItemId}`,
        );
      }

      const invoiceItem = invoiceItemsById.get(batchDto.supplierInvoiceItemId);

      if (!invoiceItem) {
        throw new BadRequestException(
          `Invalid supplierInvoiceItemId: ${batchDto.supplierInvoiceItemId}`,
        );
      }

      requestedQuantityByItem.set(
        batchDto.supplierInvoiceItemId,
        (requestedQuantityByItem.get(batchDto.supplierInvoiceItemId) ?? 0) +
          batchDto.initialQuantity,
      );
    }

    for (const [
      supplierInvoiceItemId,
      requestedQuantity,
    ] of requestedQuantityByItem) {
      const invoiceItem = invoiceItemsById.get(supplierInvoiceItemId);

      if (!invoiceItem) {
        throw new BadRequestException(
          `Invalid supplierInvoiceItemId: ${supplierInvoiceItemId}`,
        );
      }

      const alreadyBatchedQuantity = invoiceItem.batches.reduce(
        (sum, batch) => sum + batch.initialQuantity,
        0,
      );

      if (alreadyBatchedQuantity + requestedQuantity > invoiceItem.quantity) {
        throw new BadRequestException(
          `Batch quantity exceeds invoice item quantity for item ${supplierInvoiceItemId}`,
        );
      }
    }
  }

  private async createInvoiceBatches(
    tx: Prisma.TransactionClient,
    dto: AddBatchesToSupplierInvoiceDto,
    invoice: SupplierInvoiceForStocking,
    invoiceItemsById: InvoiceItemsById,
  ): Promise<void> {
    for (const batchDto of dto.batches) {
      const invoiceItem = invoiceItemsById.get(batchDto.supplierInvoiceItemId);

      if (!invoiceItem) {
        throw new BadRequestException(
          `Invalid supplierInvoiceItemId: ${batchDto.supplierInvoiceItemId}`,
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
  }

  private validateOpeningStockQuantities(
    dto: AddOpeningStockBatchesDto,
  ): void {
    for (const batchDto of dto.batches) {
      if (batchDto.initialQuantity <= 0) {
        throw new BadRequestException(
          `initialQuantity must be greater than 0 for pharmacyDrugId ${batchDto.pharmacyDrugId}`,
        );
      }
    }
  }

  private async ensureAllPharmacyDrugsBelongToPharmacy(
    tx: Prisma.TransactionClient,
    pharmacyId: number,
    dto: AddOpeningStockBatchesDto,
  ): Promise<void> {
    const pharmacyDrugIds = [
      ...new Set(dto.batches.map((batch) => batch.pharmacyDrugId)),
    ];

    const pharmacyDrugs = await tx.pharmacyDrug.findMany({
      where: {
        pharmacyId,
        pharmacyDrugId: {
          in: pharmacyDrugIds,
        },
      },
      select: {
        pharmacyDrugId: true,
      },
    });

    if (pharmacyDrugs.length !== pharmacyDrugIds.length) {
      throw new BadRequestException(
        'One or more pharmacyDrugId values are invalid for this pharmacy',
      );
    }
  }
}