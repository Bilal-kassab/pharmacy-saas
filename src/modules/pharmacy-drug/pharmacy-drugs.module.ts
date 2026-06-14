import { Module } from '@nestjs/common';
import { UnitOfWork } from '../../common/TransactionWrapper/unit-of-work';
import { PharmacyDrugService } from './pharmacy-drug.service';
import { PharmacyDrugsController } from './pharmacy-drugs.controller';
import { AddGeneralDrugUseCase } from './use-cases/add-general-drug.usecase';
import { AddPrivateDrugUseCase } from './use-cases/add-private-drug.usecase';
import { ListPharmacyDrugsUseCase } from './use-cases/list-pharmacy-drugs.usecase';

@Module({
  controllers: [
    PharmacyDrugsController,
  ],

  providers: [
    PharmacyDrugService,
    UnitOfWork,
    AddGeneralDrugUseCase,
    AddPrivateDrugUseCase,
    ListPharmacyDrugsUseCase,
  ],
})
export class PharmacyDrugsModule {}