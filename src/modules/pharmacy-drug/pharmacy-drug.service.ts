import { Injectable } from "@nestjs/common";
import { AddGeneralDrugUseCase } from "./use-cases/add-general-drug.usecase";
import { AddGeneralDrugDto } from "./dto/add-general-drug.dto";
import { AddPrivateDrugDto } from "./dto/add-private-drug.dto";
import { AddPrivateDrugUseCase } from "./use-cases/add-private-drug.usecase";
import { ListPharmacyDrugsDto } from "./dto/list-pharmacy-drugs.dto";
import { ListPharmacyDrugsUseCase } from "./use-cases/list-pharmacy-drugs.usecase";

@Injectable()
export class PharmacyDrugService {
  constructor(
    private readonly addGeneralDrugUseCase:
      AddGeneralDrugUseCase,

    private readonly addPrivateDrugUseCase:
      AddPrivateDrugUseCase,

    private readonly listPharmacyDrugsUseCase:
      ListPharmacyDrugsUseCase,
  ) {}

  addGeneralDrug(
    pharmacyId: number,
    dto: AddGeneralDrugDto,
  ) {
    return this.addGeneralDrugUseCase.execute(
      pharmacyId,
      dto,
    );
  }

  addPrivateDrug(
    pharmacyId: number,
    dto: AddPrivateDrugDto,
  ) {
    return this.addPrivateDrugUseCase.execute(
      pharmacyId,
      dto,
    );
  }

  listPharmacyDrugs(
    pharmacyId: number,
    dto: ListPharmacyDrugsDto,
  ) {
    return this.listPharmacyDrugsUseCase.execute(
      pharmacyId,
      dto,
    );
  }
}