import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { UnitOfWork } from "../../../common/TransactionWrapper/unit-of-work";
import { AddPrivateDrugDto } from "../dto/add-private-drug.dto";
import { DrugSource } from "../../../generated/prisma/enums";

@Injectable()
export class AddPrivateDrugUseCase {
  constructor(
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async execute(
    pharmacyId: number,
    dto: AddPrivateDrugDto,
  ) {
    return this.unitOfWork.execute(
      async (tx) => {
        const dosageForm =
          await tx.dosageForm.findUnique({
            where: {
              dosageFormId:
                dto.dosageFormId,
            },
          });

        if (!dosageForm) {
          throw new NotFoundException(
            'Dosage form not found',
          );
        }

        const barcodeExists =
          await tx.privateDrug.findUnique({
            where: {
              barcode: dto.barcode,
            },
          });

        if (barcodeExists) {
          throw new ConflictException(
            'Barcode already exists',
          );
        }

        const drug = await tx.drug.create({
          data: {
            source: DrugSource.PRIVATE,
          },
        });

        const privateDrug =
          await tx.privateDrug.create({
            data: {
              drugId: drug.drugId,

              dosageFormId:
                dto.dosageFormId,

              tradeName:
                dto.tradeName.trim(),

              barcode:
                dto.barcode.trim(),

              unitsPerBox:
                dto.unitsPerBox,

              isRx:
                dto.isRx ?? false,
            },
          });

        const pharmacyDrug =
          await tx.pharmacyDrug.create({
            data: {
              pharmacyId,

              drugId:
                drug.drugId,

              minStockAlert:
                dto.minStockAlert,

              sellPart:
                dto.sellPart ?? false,

              netPrice:
                dto.netPrice,

              consumerPrice:
                dto.consumerPrice,

              notes:
                dto.notes?.trim(),
            },
          });

        if (dto.storageLocation) {
          await tx.drugLocation.create({
            data: {
              pharmacyDrugId:
                pharmacyDrug.pharmacyDrugId,

              storageLocation:
                dto.storageLocation.trim(),
            },
          });
        }

        return {
          pharmacyDrugId:
            pharmacyDrug.pharmacyDrugId,

          drugId:
            drug.drugId,

          privateDrugId:
            privateDrug.privateDrugId,
        };
      },
    );
  }
}