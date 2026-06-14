import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { AddGeneralDrugDto } from "../dto/add-general-drug.dto";
import { UnitOfWork } from "../../../common/TransactionWrapper/unit-of-work";

@Injectable()
export class AddGeneralDrugUseCase {
  constructor(
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async execute(
    pharmacyId: number,
    dto: AddGeneralDrugDto,
  ) {
    return this.unitOfWork.execute(
      async (tx) => {
        const generalDrug =
          await tx.generalDrug.findUnique({
            where: {
              generalDrugId:
                dto.generalDrugId,
            },
          });

        if (!generalDrug) {
          throw new NotFoundException(
            'General drug not found',
          );
        }

        const exists =
          await tx.pharmacyDrug.findUnique({
            where: {
              pharmacyId_drugId: {
                pharmacyId,
                drugId:
                  generalDrug.drugId,
              },
            },
          });

        if (exists) {
          throw new ConflictException(
            'Drug already exists in this pharmacy',
          );
        }

        const pharmacyDrug =
          await tx.pharmacyDrug.create({
            data: {
              pharmacyId,

              drugId:
                generalDrug.drugId,

              minStockAlert:
                dto.minStockAlert,

              sellPart:
                dto.sellPart ?? false,

              netPrice:
                dto.netPrice,

              consumerPrice:
                dto.consumerPrice,

              expiryDateAlarm:
                dto.expiryDateAlarm
                  ? new Date(
                      dto.expiryDateAlarm,
                    )
                  : undefined, 

              notes:
                dto.notes,
            },
          });

        if (dto.storageLocation) {
          await tx.drugLocation.create({
            data: {
              pharmacyDrugId:
                pharmacyDrug.pharmacyDrugId,

              storageLocation:
                dto.storageLocation,
            },
          });
        }

        return pharmacyDrug;
      },
    );
  }
  
 
}