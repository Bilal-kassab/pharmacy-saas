import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Prisma } from '../../generated/prisma/client';

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

  findAll(pharmacyId?: number) {
    return this.prisma.supplier.findMany({
      where: pharmacyId ? { pharmacyId } : undefined,
      orderBy: { supplierName: 'asc' },
    });
  }

  async findOne(id: number) {
    const s = await this.prisma.supplier.findUnique({ where: { supplierId: id } });
    if (!s) throw new NotFoundException('Supplier not found');
    return s;
  }

  async update(id: number, dto: UpdateSupplierDto) {
    const existing = await this.prisma.supplier.findUnique({ where: { supplierId: id } });
    if (!existing) throw new NotFoundException('Supplier not found');

    if (dto.pharmacyId !== undefined) {
      await this.ensurePharmacyExists(dto.pharmacyId);
    }

    try {
      return this.prisma.supplier.update({
        where: { supplierId: id },
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

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.supplier.delete({ where: { supplierId: id } });
    return { message: 'Supplier deleted successfully' };
  }

  private async ensurePharmacyExists(pharmacyId: number) {
    const p = await this.prisma.pharmacy.findUnique({ where: { pharmacyId } });
    if (!p) throw new BadRequestException('Invalid pharmacyId');
  }
}
