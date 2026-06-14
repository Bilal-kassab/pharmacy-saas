import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { ListPharmacyDrugsDto } from '../dto/list-pharmacy-drugs.dto';

@Injectable()
export class ListPharmacyDrugsUseCase {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    pharmacyId: number,
    dto: ListPharmacyDrugsDto,
  ) {
    const skip = (dto.page - 1) * dto.limit;

    /*
     * الشرط الأساسي دائمًا هو pharmacyId القادم من التوكن.
     * لذلك لن تظهر أدوية صيدلية أخرى.
     */
    const where: Prisma.PharmacyDrugWhereInput = {
      pharmacyId,
    };

    /*
     * فلترة حسب مصدر الدواء:
     * GENERAL = دواء عام من Central DB
     * PRIVATE = دواء خاص بالصيدلية
     */
    if (dto.source) {
      where.drug = {
        source: dto.source,
      };
    }

    /*
     * البحث بالاسم في كلا النوعين:
     * generalDrug و privateDrug
     */
    if (dto.name) {
      where.OR = [
        {
          drug: {
            generalDrug: {
              is: {
                tradeName: {
                  contains: dto.name,
                  mode: 'insensitive',
                },
              },
            },
          },
        },
        {
          drug: {
            privateDrug: {
              is: {
                tradeName: {
                  contains: dto.name,
                  mode: 'insensitive',
                },
              },
            },
          },
        },
      ];
    }

    /*
     * نجلب البيانات والعدد الإجمالي في الوقت نفسه.
     * العدد الإجمالي ضروري لحساب عدد الصفحات.
     */
    const [pharmacyDrugs, totalItems] =
      await Promise.all([
        this.prisma.pharmacyDrug.findMany({
          where,

          skip,
          take: dto.limit,

          orderBy: {
            createdAt: 'desc',
          },

        //   select: {
        //     pharmacyDrugId: true,
        //     drugId: true,
        //     minStockAlert: true,
        //     sellPart: true,
        //     netPrice: true,
        //     consumerPrice: true,
        //     expiryDateAlarm: true,
        //     isActive: true,
        //     notes: true,

        //     drugLocations: {
        //       select: {
        //         drugLocationId: true,
        //         storageLocation: true,
        //       },
        //     },

        //     drug: {
        //       select: {
        //         source: true,

        //         generalDrug: {
        //           select: {
        //             generalDrugId: true,
        //             tradeName: true,
        //             barcode: true,
        //             unitsPerBox: true,
        //             netPrice: true,
        //             consumerPrice: true,
        //             isRx: true,
        //           },
        //         },

        //         privateDrug: {
        //           select: {
        //             privateDrugId: true,
        //             tradeName: true,
        //             barcode: true,
        //             unitsPerBox: true,
        //             isRx: true,
        //           },
        //         },
        //       },
        //     },
        //   },
        }),

        this.prisma.pharmacyDrug.count({
          where,
        }),
      ]);

    /*
     * نوحّد شكل النتيجة حتى يحصل Frontend
     * على شكل واحد سواء كان الدواء GENERAL أو PRIVATE.
     */
    
    const pages = Math.ceil(totalItems / dto.limit);
    const hasNextPage = dto.page < pages;
    const hasPreviousPage = dto.page > 1;

    return {
      data: pharmacyDrugs,
      page: dto.page,
      limit: dto.limit,
      total: totalItems,
      pages,
      hasNextPage,
      hasPreviousPage,
    };
    
  }
}