import {
  BadRequestException,
  ConflictException,
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

@Injectable()
export class AuthenticationService {
  constructor(

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

  async generateTokens() {
    // const [accessToken, refreshToken] = await Promise.all([
    //   this.signToken(user.id, this.jwtConfiguration.accessTokenTtl, {
    //     email: user.email,
    //     type: 'access',
    //     role: user.role,
    //   }),
    //   this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl, {
    //     type: 'refresh',
    //   }),
    // ]);
    // // return user;
    // return { accessToken, refreshToken };
  }

  private async signToken<T>(userId: number, expiresIn: number, payload?: T) {

    // return await this.jwtService.signAsync(
    //   {
    //     // payload
    //     sub: userId,
    //     ...payload,
    //   },
    //   {
    //     // options
    //     secret: this.jwtConfiguration.secret,
    //     audience: this.jwtConfiguration.audience,
    //     issuer: this.jwtConfiguration.issuer,
    //     expiresIn,
    //   },
    // );
  }

  getProfile(id: number) {
    // return this.userRepository.findOneBy({ id });
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
}
