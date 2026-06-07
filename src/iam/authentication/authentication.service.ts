import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { HashingService } from '../hashing/hashing/hashing.service';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { SingUpDto } from './dto/sing-up.dto/sing-up.dto';
import { SingInDto } from './dto/sing-in.dto/sing-in.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto/refresh-token.dto';
import { AccountType, UserAccountStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { FirstPharmacyRegisterDto } from './dto/first-pharmacy-register.dto';
import { FirstUserRegisterDto } from './dto/first-user-register.dto';
import { ActiveUserData } from '../interfaces/actice-user-data.interface';
import { PharmacySignInDto } from './dto/pharmacy-sign-in.dto';

type AccessTokenPayload = {
  email: string;
  accountType: AccountType;
  type: 'access';
};

type RefreshTokenPayload = {
  type: 'refresh';
};

type PharmacyAccessTokenPayload = {
  accountType: typeof AccountType.PHARMACY;
  type: 'access';
};
@Injectable()
export class AuthenticationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async SignUp(signUpDto: SingUpDto) {
    // const queryRunner = this.dataSource.createQueryRunner();
    // await queryRunner.connect();
    // await queryRunner.startTransaction();
    // try {
    //   const user = new UserEntity();
    //   user.email = signUpDto.email;
    //   user.password = await this.hashingService.hash(signUpDto.password);
    //   user.name = signUpDto.full_name;
    //   user.phone_number = signUpDto?.phone_number ?? null;
    //   user.role = signUpDto.role;
    //   //  return await this.userRepository.save(user);
    //   const savedUser = await this.userRepository.save(user);
    //   // const otp = await this.otpService.generateOtpForUser(savedUser);
    //   queryRunner.manager.save(savedUser);
    //   await queryRunner.commitTransaction();
    //   return savedUser;
    // } catch (error) {
    //   await queryRunner.rollbackTransaction();
    //   const pgUniqueViolationErrorCode = '23505';
    //   if (error.code === pgUniqueViolationErrorCode) {
    //     // throw new Error('Email already in use');
    //     throw new ConflictException();
    //   }
    //   throw error;
    // } finally {
    //   await queryRunner.release();
    // }
  }

  async signInUser(signInDto: SingInDto) {
   const user = await this.prisma.userAccount.findUnique({
      where: {
        email: signInDto.email,
        // phone: signInDto.phone,
      },
      select: {
        userId: true,
        email: true,
        fullName: true,
        passwordHash: true,
        accountType: true,
        status: true,
      },
    });
     if (!user) {
        throw new UnauthorizedException('بيانات الاعتماد غير صحيحة');
      }
     if (user.status !== UserAccountStatus.ACTIVE) {
        throw new ConflictException('الحساب غير نشط بعد');
      }
      // const isPasswordValid = await this.hashingService.compare(
      //   signInDto.password,
      //   user.passwordHash,
      // );
      // if (!isPasswordValid) {
      //   throw new UnauthorizedException('بيانات الاعتماد غير صحيحة');
      // }
    
    const tokens = await this.generateTokens({
      userId: user.userId,
      email: user.email,
      accountType: user.accountType,
    });
    return {
      message: 'Login successful',
      // user: {
      //   userId: user.userId,
      //   email: user.email,
      //   fullName: user.fullName,
      //   accountType: user.accountType,
      //   status: user.status,
      // },
      tokens,
    };
  }
  async signIn(signInDto: SingInDto) {
    // const user = await this.userRepository.findOne({
    //   where: { email: signInDto.email },
    //   select: [
    //     'id',
    //     'name',
    //     'email',
    //     'phone_number',
    //     'password',
    //     'role',
    //     'created_at',
    //     'updated_at',
    //   ],
    // });
    // // console.log("user",user);
    // if (!user) {
    //   throw new UnauthorizedException('Invalid credentials');
    // }
    // const isEqual = await this.hashingService.compare(
    //   signInDto.password,
    //   user.password,
    // );
    // if (!isEqual) {
    //   throw new UnauthorizedException('Password mismatch');
    // }
    // if (signInDto.role && user.role !== signInDto.role) {
    //   throw new UnauthorizedException('Invalid role selected');
    // }
    // return await this.generateTokens(user);

  }
  // async signInUser(signInDto: SingInDto) {
  //   // const user = await this.userRepository.findOne({
  //   //   where: { email: signInDto.email },
  //   //   select: [
  //   //     'id',
  //   //     'name',
  //   //     'email',
  //   //     'phone_number',
  //   //     'password',
  //   //     'role',
  //   //     'created_at',
  //   //     'updated_at',
  //   //   ],
  //   // });
  //   // // console.log("user",user);
  //   // if (!user) {
  //   //   throw new UnauthorizedException('Invalid credentials');
  //   // }
  //   // const isEqual = await this.hashingService.compare(
  //   //   signInDto.password,
  //   //   user.password,
  //   // );
  //   // if (!isEqual) {
  //   //   throw new UnauthorizedException('Password mismatch');
  //   // }

  //   // if (signInDto.role && user.role !== signInDto.role) {
  //   //   throw new UnauthorizedException('Invalid role selected');
  //   // }
  //   // return await this.generateTokens(user);
  // }

  async generateTokens(user: {
    userId: number;
    email: string;
    accountType: AccountType;
  }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<AccessTokenPayload>(
        user.userId,
        this.jwtConfiguration.accessTokenTtl,
        {
          email: user.email,
          accountType: user.accountType,
          type: 'access',
        },
      ),

      this.signToken<RefreshTokenPayload>(
        user.userId,
        this.jwtConfiguration.refreshTokenTtl,
        {
          type: 'refresh',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
  private async signToken<T>(userId: number, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        // payload
        sub: userId,
        ...payload,
      },
      {
        // options
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        expiresIn,
      },
    );
  }

  getProfile(id: number) {
    return this.prisma.userAccount.findUnique({
      where: {
        userId: id,
      },
      select: {
        userId: true,
        email: true,
        fullName: true,
        phone: true,
        accountType: true,
      },
    });
  }

  async refreshTokens(refreshTokens: RefreshTokenDto) {
    // console.log("inside");
    // try {
    //   const payload = await this.jwtService.verifyAsync(
    //     refreshTokens.refreshToken,
    //     {
    //       secret: this.jwtConfiguration.secret,
    //       audience: this.jwtConfiguration.audience,
    //       issuer: this.jwtConfiguration.issuer,
    //     },
    //   );
    //   if (payload.type !== 'refresh') {
    //     throw new UnauthorizedException('Invalid token type');
    //   }
    //   const user = await this.userRepository.findOneByOrFail({
    //     id: payload.sub,
    //   });
    //   return this.generateTokens(user);
    // } catch (error) {
    //   throw new UnauthorizedException(error.message);
    // }
  }

  async pharmacyFirstRegister(dto: FirstPharmacyRegisterDto) {
    if (dto.pharmacyPassword !== dto.pharmacyPasswordConfirmation) {
      throw new BadRequestException('Password confirmation does not match.');
    }

    const userAccount = await this.prisma.userAccount.findUnique({
      where: {
        email: dto.OwnerEmail,
      },
      include: {
        pharmacyOwner: true,
      },
    });

    if (!userAccount) {
      throw new UnauthorizedException('Owner account was not found.');
    }

    if (!userAccount.pharmacyOwner) {
      throw new ForbiddenException('Pharmacy owner profile was not found.');
    }

    const pharmacyCredential = await this.prisma.pharmacyCredential.findUnique({
      where: {
        loginCode: dto.pharmacyLoginCode,
      },
      include: {
        pharmacy: true,
      },
    });

    if (!pharmacyCredential) {
      throw new UnauthorizedException('Invalid pharmacy activation code.');
    }

    if (
      pharmacyCredential.pharmacy.pharmacyOwnerId !==
      userAccount.pharmacyOwner.pharmacyOwnerId
    ) {
      throw new ForbiddenException(
        'This pharmacy does not belong to the authenticated owner.',
      );
    }

    if (pharmacyCredential.passwordHash || pharmacyCredential.activatedAt) {
      throw new ConflictException('Pharmacy account is already activated.');
    }

    const passwordHash = await this.hashingService.hash(dto.pharmacyPassword);

    const updateResult = await this.prisma.pharmacyCredential.updateMany({
      where: {
        pharmacyCredentialId: pharmacyCredential.pharmacyCredentialId,
        passwordHash: null,
        activatedAt: null,
      },
      data: {
        passwordHash,
        activatedAt: new Date(),
      },
    });

    if (updateResult.count !== 1) {
      throw new ConflictException('Pharmacy account is already activated.');
    }

    const updatedCredential =
      await this.prisma.pharmacyCredential.findUniqueOrThrow({
        where: {
          pharmacyCredentialId: pharmacyCredential.pharmacyCredentialId,
        },
        include: {
          pharmacy: true,
        },
      });

    return {
      pharmacy: {
        pharmacyId: updatedCredential.pharmacy.pharmacyId,
        pharmacyName: updatedCredential.pharmacy.pharmacyName,
        pharmacyCode: updatedCredential.pharmacy.pharmacyCode,
        status: updatedCredential.pharmacy.status,
        activatedAt: updatedCredential.activatedAt,
      },
    };
  }

  async firstRegisterUser(dto: FirstUserRegisterDto) {
    if (dto.password !== dto.passwordConfirmation) {
      throw new BadRequestException('Password confirmation does not match.');
    }

    const user = await this.prisma.userAccount.findUnique({
      where: {
        loginCode: dto.loginCode,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid activation code.');
    }

    if (user.email !== dto.email) {
      throw new BadRequestException(
        'Activation code does not match the provided email.',
      );
    }

    if (user.accountType !== dto.accountType) {
      throw new BadRequestException(
        'Activation code does not match the selected account type.',
      );
    }

    if (user.status === UserAccountStatus.SUSPENDED) {
      throw new ForbiddenException('This account is suspended.');
    }

    if (user.passwordHash) {
      throw new ConflictException('Account is already activated.');
    }

    const passwordHash = await this.hashingService.hash(dto.password);

    const updateResult = await this.prisma.userAccount.updateMany({
      where: {
        userId: user.userId,
        email: dto.email,
        loginCode: dto.loginCode,
        accountType: dto.accountType,
        passwordHash: null,
      },
      data: {
        passwordHash,
        status: UserAccountStatus.ACTIVE,
      },
    });

    if (updateResult.count !== 1) {
      throw new ConflictException('Account is already activated.');
    }

    const updatedUser = await this.prisma.userAccount.findUniqueOrThrow({
      where: {
        userId: user.userId,
      },
    });

    // const tokens = await this.generateTokens({
    //   userId: updatedUser.userId,
    //   email: updatedUser.email,
    //   accountType: updatedUser.accountType,
    // });

    return {
      user: {
        userId: updatedUser.userId,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        accountType: updatedUser.accountType,
        status: updatedUser.status,
      },
      // tokens,
    };
  }

  async generatePharmacyTokens(pharmacy: { pharmacyId: number }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<PharmacyAccessTokenPayload>(
        pharmacy.pharmacyId,
        this.jwtConfiguration.accessTokenTtl,
        {
          accountType: AccountType.PHARMACY,
          type: 'access',
        },
      ),

      this.signToken<RefreshTokenPayload>(
        pharmacy.pharmacyId,
        this.jwtConfiguration.refreshTokenTtl,
        {
          type: 'refresh',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async pharmacySignIn(dto: PharmacySignInDto) {
    const credential = await this.prisma.pharmacyCredential.findUnique({
      where: {
        loginCode: dto.loginCode,
      },
      include: {
        pharmacy: true,
      },
    });

    if (!credential) {
      throw new UnauthorizedException('Invalid pharmacy credentials.');
    }

    if (!credential.passwordHash || !credential.activatedAt) {
      throw new ForbiddenException(
        'Pharmacy account is not activated yet. Please complete first register.',
      );
    }

    if (credential.lockedUntil && credential.lockedUntil > new Date()) {
      throw new ForbiddenException('Pharmacy account is temporarily locked.');
    }

    const isPasswordValid = await this.hashingService.compare(
      dto.password,
      credential.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid pharmacy credentials.');
    }

    const tokens = await this.generatePharmacyTokens({
      pharmacyId: credential.pharmacy.pharmacyId,
    });

    return {
      pharmacy: {
        pharmacyId: credential.pharmacy.pharmacyId,
        pharmacyName: credential.pharmacy.pharmacyName,
        pharmacyCode: credential.pharmacy.pharmacyCode,
        status: credential.pharmacy.status,
      },
      tokens,
    };
  }
}
