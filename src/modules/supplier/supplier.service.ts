import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Prisma } from '../../generated/prisma/client';
import { SupplierFilterDto } from './dto/create-supplier-filter.dto';

@Injectable()
export class SupplierService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSupplierDto) {
    try {
      await this.ensurePharmacyExists(dto.pharmacyId);
      return this.prisma.supplier.create({
        data: {
          pharmacyId: dto.pharmacyId,
          supplierName: dto.supplierName,
          phone: dto.phone,
          address: dto.address,
          notes: dto.notes,
        },
      });
    } catch (error) {
      if ((error as any).code === 'P2002') {
        throw new ConflictException('Supplier unique constraint violation');
      }
      throw error;
    }
  }

  findAll(pharmacyId: number, filters?: SupplierFilterDto) {
    const { searchQuery } = filters || {};

    return this.prisma.supplier.findMany({
      where: {
        pharmacyId,
        ...(searchQuery
          ? {
              OR: [
                {
                  supplierName: { contains: searchQuery, mode: 'insensitive' },
                },
                { phone: { contains: searchQuery, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { supplierName: 'asc' },
    });
  }

  // 2. جلب معلومات مورد محدد خاص بصيدليتي فقط
  async findOne(id: number, pharmacyId: number) {
    const s = await this.prisma.supplier.findFirst({
      where: {
        supplierId: id,
        pharmacyId: pharmacyId,
      },
    });

    if (!s)
      throw new NotFoundException(
        'Supplier not found or belongs to another pharmacy',
      );
    return s;
  }

  async update(id: number, dto: UpdateSupplierDto, pharmacyId: number) {
    const existing = await this.prisma.supplier.findUnique({
      where: { supplierId: id, pharmacyId: pharmacyId },
    });
    if (!existing) throw new NotFoundException('Supplier not found');

    if (dto.pharmacyId !== undefined) {
      await this.ensurePharmacyExists(dto.pharmacyId);
    }

    try {
      return this.prisma.supplier.update({
        where: { supplierId: id, pharmacyId: pharmacyId },
        data: {
          pharmacyId: dto.pharmacyId,
          supplierName: dto.supplierName,
          phone: dto.phone,
          address: dto.address,
          notes: dto.notes,
        },
      });
    } catch (error) {
      if ((error as any).code === 'P2002') {
        throw new ConflictException('Supplier unique constraint violation');
      }
      throw error;
    }
  }

  async remove(id: number, pharmacyId: number) {
    await this.findOne(id, pharmacyId); // Ensure supplier exists and belongs to the pharmacy
    await this.prisma.supplier.delete({ where: { supplierId: id } });
    return { message: 'Supplier deleted successfully' };
  }

  private async ensurePharmacyExists(pharmacyId: number) {
    const p = await this.prisma.pharmacy.findUnique({ where: { pharmacyId } });
    if (!p) throw new BadRequestException('Invalid pharmacyId');
  }
}
