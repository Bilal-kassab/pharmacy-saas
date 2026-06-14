import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AccountType,
  Prisma,
  UserAccountStatus,
} from '../../generated/prisma/client';
import { CodeType } from '../../common/Enums/code-type.enum';
import { CodeGenerationService } from '../../common/code-generation/code-generation.service';
import { CreatePharmacyOwnerDto } from './dto/create-pharmacy-owner.dto';
import { UpdatePharmacyOwnerDto } from './dto/update-pharmacy-owner.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ListPharmacyOwnersDto } from './dto/list-pharmacy-owners.dto';

type TransactionClient = Prisma.TransactionClient;

export type PharmacyOwnerAccountResult = {
  userId: number;
  pharmacyOwnerId: number;
  fullName: string;
  email: string;
  accountType: AccountType;
  status: UserAccountStatus;
  loginCode: string;
};

@Injectable()
export class PharmacyOwnersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly codeGenerationService: CodeGenerationService,
  ) {}

  async createForPharmacyAccount(
    tx: TransactionClient,
    dto: CreatePharmacyOwnerDto,
  ): Promise<PharmacyOwnerAccountResult> {
    await this.ensureNewOwnerDataIsUnique(tx, dto);

    const ownerLoginCode = await this.generateUniqueOwnerLoginCode(tx);

    const userAccount = await tx.userAccount.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        fullName: dto.fullName,
        loginCode: ownerLoginCode,
        accountType: AccountType.PHARMACY_OWNER,
        status: UserAccountStatus.ACTIVE,
      },
    });

    const pharmacyOwner = await tx.pharmacyOwner.create({
      data: {
        userId: userAccount.userId,
        nationalId: dto.nationalId,
      },
    });

    return {
      userId: userAccount.userId,
      pharmacyOwnerId: pharmacyOwner.pharmacyOwnerId,
      fullName: userAccount.fullName,
      email: userAccount.email,
      accountType: userAccount.accountType,
      status: userAccount.status,
      loginCode: userAccount.loginCode,
    };
  }

  async findExistingForPharmacyAccount(
    tx: TransactionClient,
    pharmacyOwnerId: number,
  ): Promise<PharmacyOwnerAccountResult> {
    const existingOwner = await tx.pharmacyOwner.findUnique({
      where: {
        pharmacyOwnerId,
      },
      include: {
        user: true,
      },
    });

    if (!existingOwner) {
      throw new NotFoundException('Pharmacy owner was not found.');
    }

    return {
      userId: existingOwner.user.userId,
      pharmacyOwnerId: existingOwner.pharmacyOwnerId,
      fullName: existingOwner.user.fullName,
      email: existingOwner.user.email,
      accountType: existingOwner.user.accountType,
      status: existingOwner.user.status,
      loginCode: existingOwner.user.loginCode,
    };
  }

  private async ensureNewOwnerDataIsUnique(
    client: TransactionClient | PrismaService,
    dto: CreatePharmacyOwnerDto,
  ) {
    const existingUserByEmail = await client.userAccount.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existingUserByEmail) {
      throw new ConflictException('Owner email is already used.');
    }

    const existingUserByPhone = await client.userAccount.findUnique({
      where: {
        phone: dto.phone,
      },
    });

    if (existingUserByPhone) {
      throw new ConflictException('Owner phone is already used.');
    }

    const existingOwnerByNationalId = await client.pharmacyOwner.findUnique({
      where: {
        nationalId: dto.nationalId,
      },
    });

    if (existingOwnerByNationalId) {
      throw new ConflictException('Owner national ID is already used.');
    }
  }

  private async generateUniqueOwnerLoginCode(
    client: TransactionClient | PrismaService,
  ): Promise<string> {
    while (true) {
      const code = this.codeGenerationService.generate({
        length: 8,
        type: CodeType.ALPHANUMERIC,
        prefix: 'OWN',
      });

      const existingUser = await client.userAccount.findUnique({
        where: {
          loginCode: code,
        },
      });

      if (!existingUser) {
        return code;
      }
    }
  }

  create(createPharmacyOwnerDto: CreatePharmacyOwnerDto) {
    return 'This action adds a new pharmacyOwner';
  }

  async findAll(
  dto: ListPharmacyOwnersDto,
) {
  
  const skip = (dto.page - 1) * dto.limit;

  const userFilter: Prisma.UserAccountWhereInput = {};

  if (dto.name) {
    userFilter.fullName = {
      contains: dto.name,
      mode: 'insensitive',
    };
  }
   // if (dto.phone) {
  //   userFilter.phone = {
  //     contains: dto.phone,
  //   };
  // }
  const where: Prisma.PharmacyOwnerWhereInput =
    Object.keys(userFilter).length > 0
      ? {
          user: userFilter,
        }
      : {};

  const [pharmacyOwners, totalItems] =
    await Promise.all([
      this.prisma.pharmacyOwner.findMany({
        where,

        skip,
        take: dto.limit,

        orderBy: {
          createdAt: 'desc',
        },

        select: {
          pharmacyOwnerId: true,
          createdAt: true,
          updatedAt: true,

          user: {
            select: {
              userId: true,
              fullName: true,
              email: true,
              phone: true,
              status: true,
            },
          },

          // _count: {
          //   select: {
          //     pharmacies: true,
          //   },
          // },
        },
      }),

      this.prisma.pharmacyOwner.count({
        where,
      }),
    ]);

    const pages = Math.ceil(totalItems / dto.limit);
    const hasNextPage = dto.page < pages;
    const hasPreviousPage = dto.page > 1;

    return {
      data: pharmacyOwners,
      page: dto.page,
      limit: dto.limit,
      total: totalItems,
      pages,
      hasNextPage,
      hasPreviousPage,
    };
  }
  

  findOne(id: number) {
    return `This action returns a #${id} pharmacyOwner`;
  }

  update(id: number, updatePharmacyOwnerDto: UpdatePharmacyOwnerDto) {
    return `This action updates a #${id} pharmacyOwner`;
  }

  remove(id: number) {
    return `This action removes a #${id} pharmacyOwner`;
  }
}
