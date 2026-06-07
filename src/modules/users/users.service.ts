import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CodeGenerationService } from '../../common/code-generation/code-generation.service';
import { UserAccountStatus } from '../../generated/prisma/enums';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly codeGenerationService: CodeGenerationService,
  ) {}
  // async create(createUserDto: CreateUserDto) {
  //   // if (
  //   //   createUserDto.accountType !== AccountType.ADMIN &&
  //   //   createUserDto.accountType !== AccountType.MEDICAL_TEAM
  //   // ) {
  //   //   throw new ConflictException(
  //   //     'Only ADMIN and MEDICAL_TEAM users can be created from this API',
  //   //   );
  //   // }

  //   const loginCode = await this.codeGenerationService.generate({prefix: 'ADM'});

  //   try {
  //     const user = await this.prisma.userAccount.create({
  //       data: {
  //         email: createUserDto.email,
  //         phone: createUserDto.phone,
  //         fullName: createUserDto.fullName,
  //         // No password yet. The user will set it later using loginCode.
  //         passwordHash: null,
  //         accountType: createUserDto.accountType,
  //         // because the account is not activated yet.
  //         status: UserAccountStatus.PENDING,
  //         loginCode,
  //       },
  //       select: {
  //         userId: true,
  //         email: true,
  //         phone: true,
  //         fullName: true,
  //         accountType: true,
  //         status: true,
  //         loginCode: true,
  //         createdAt: true,
  //       },
  //     });

  //     return {
  //       message: 'User created successfully',
  //       user,
  //     };
  //   } catch (error) {
  //     return {
  //         message: error instanceof Error ? error.message : 'An error occurred while creating the user',
  //         user: null
  //       } ;
  //   }
  // }

  async create(createUserDto: CreateUserDto) {
    await this.validateUserUniqueness(createUserDto);

    const loginCode = await this.codeGenerationService.generate({
      prefix: 'ADM',
    });

    try {
      const user = await this.prisma.userAccount.create({
        data: {
          email: createUserDto.email,
          phone: createUserDto.phone,
          fullName: createUserDto.fullName,
          passwordHash: null,
          accountType: createUserDto.accountType,
          status: UserAccountStatus.PENDING,
          loginCode,
        },
        select: {
          userId: true,
          email: true,
          phone: true,
          fullName: true,
          accountType: true,
          status: true,
          loginCode: true,
          createdAt: true,
        },
      });

      return {
        message: 'User created successfully',
        user,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email or phone number already exists');
      }

      throw error;
    }
  }

  private async validateUserUniqueness(
    createUserDto: CreateUserDto,
  ): Promise<void> {
    const existingUser = await this.prisma.userAccount.findFirst({
      where: {
        OR: [
          {
            email: createUserDto.email,
          },
          {
            phone: createUserDto.phone,
          },
        ],
      },
      select: {
        email: true,
        phone: true,
      },
    });

    if (!existingUser) {
      return;
    }

    if (existingUser.email === createUserDto.email) {
      throw new ConflictException('Email already exists');
    }

    if (existingUser.phone === createUserDto.phone) {
      throw new ConflictException('Phone number already exists');
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
