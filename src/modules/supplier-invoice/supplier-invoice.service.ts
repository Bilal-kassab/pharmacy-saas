import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSupplierInvoiceDto } from './dto/create-supplier-invoice.dto';
import { UpdateSupplierInvoiceDto } from './dto/update-supplier-invoice.dto';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SupplierInvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return `This action returns all supplierInvoice`;
  }

  findOne(id: number) {
    return `This action returns a #${id} supplierInvoice`;
  }

  update(id: number, updateSupplierInvoiceDto: UpdateSupplierInvoiceDto) {
    return `This action updates a #${id} supplierInvoice`;
  }

  remove(id: number) {
    return `This action removes a #${id} supplierInvoice`;
  }

  // async create(pharmacyId: number, dto: CreateSupplierInvoiceDto) {
  //   if (!dto.items?.length) {
  //     throw new BadRequestException('items required');
  //   }

  //   return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
  //     await this.assertSupplierBelongsToPharmacy(
  //       dto.supplierId,
  //       pharmacyId,
  //       tx,
  //     );
  //     await this.assertPharmacyDrugsBelongToPharmacy(dto.items, pharmacyId, tx);

  //     const totalAmount = dto.items.reduce(
  //       (s, it) => s + it.unitPrice * it.quantityBoxes,
  //       0,
  //     );

  //     const created = await tx.supplierInvoice.create({
  //       data: {
  //         pharmacyId,
  //         supplierId: dto.supplierId,
  //         invoiceNumber: dto.invoiceNumber ?? undefined,
  //         invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : new Date(),
  //         notes: dto.notes,
  //         totalAmount,
  //         items: {
  //           create: dto.items.map((it) => ({
  //             pharmacyDrug: { connect: { pharmacyDrugId: it.pharmacyDrugId } },
  //             orderedQuantityBoxes: it.quantityBoxes,
  //             unitPrice: it.unitPrice,
  //             netAmount: it.unitPrice * it.quantityBoxes,
  //             notes: it.notes,
  //             batchNumber: it.batchNumber,
  //             expiryDate: it.expiryDate ? new Date(it.expiryDate) : undefined,
  //           })),
  //         },
  //       },
  //       include: { items: true },
  //     });

  //     // Optional: create Batches or StockMovements per item here using tx.batch.create or tx.stockMovement.create
  //     // Example (pseudocode):
  //     // for (const it of dto.items) {
  //     //   if (it.batchNumber) {
  //     //     await tx.batch.create({ data: { pharmacyDrugId: it.pharmacyDrugId, batchNumber: it.batchNumber, expiryDate: it.expiryDate ? new Date(it.expiryDate) : undefined, quantityBoxes: it.quantityBoxes, supplierInvoiceId: created.supplierInvoiceId } });
  //     //     // optionally update inventory
  //     //   }
  //     // }

  //     return created;
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
    items: { pharmacyDrugId: number }[],
    pharmacyId: number,
    tx: Prisma.TransactionClient,
  ) {
    const ids = Array.from(new Set(items.map((i) => i.pharmacyDrugId)));
    const found = await tx.pharmacyDrug.findMany({
      where: { pharmacyDrugId: { in: ids }, pharmacyId },
      select: { pharmacyDrugId: true },
    });
    if (found.length !== ids.length) {
      throw new BadRequestException(
        'One or more pharmacyDrugId are invalid or not owned by this pharmacy',
      );
    }
    return found;
  }
}
