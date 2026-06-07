import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SingInDto } from './dto/sing-in.dto/sing-in.dto';
import { SingUpDto } from './dto/sing-up.dto/sing-up.dto';
import { AuthType } from './enums/auth-type.enum';

import { ActiveUser } from '../decorators/active-user.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto/refresh-token.dto';
import { Auth } from './decorators/auth.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { FirstPharmacyRegisterDto } from './dto/first-pharmacy-register.dto';
import { ActiveUserData } from '../interfaces/actice-user-data.interface';
import { FirstUserRegisterDto } from './dto/first-user-register.dto';
import { PharmacySignInDto } from './dto/pharmacy-sign-in.dto';
import { PharmacyStatusGuard } from '../authorization/guards/roles/pharmacy-status.guard';
import { AllowPharmacyStatuses } from '../authorization/decorators/allow-pharmacy-statuses.decorator';
import { AccountType, PharmacyStatus } from '../../generated/prisma/enums';
import { Roles } from '../authorization/decorators/roles.decorator';
import { SkipPharmacyStatusCheck } from '../authorization/decorators/skip-pharmacy-status-check.decorator';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Auth(AuthType.None)
  @Post('user/sign-up')
  async userSignUp(@Body() signUpDto: SingUpDto) {}

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('sign-in-user')
  async signInUser(@Body() signInDto: SingInDto) {
    return await this.authenticationService.signInUser(signInDto);
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(@Body() signInDto: SingInDto) {}

  // @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Get('profile')
  @Roles(
    AccountType.ADMIN,
    AccountType.PHARMACY_OWNER,
    AccountType.MEDICAL_TEAM,
  )
  async getProfile(@ActiveUser() user: any) {
    const profile = await this.authenticationService.getProfile(user.sub);
    return { data: profile, message: 'Profile fetched successfully.' };
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  async refreshTokens(@Body() refreshTokens: RefreshTokenDto) {
    const tokens =
      await this.authenticationService.refreshTokens(refreshTokens);
    return { data: tokens, message: 'Tokens refreshed successfully.' };
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('users/first-register')
  @ResponseMessage('User account activated successfully.')
  ownerFirstRegister(@Body() dto: FirstUserRegisterDto) {
    return this.authenticationService.firstRegisterUser(dto);
  }

  // @Auth(AuthType.None)
  // @HttpCode(HttpStatus.OK)
  // @Post('owners/sign-in')
  // @ResponseMessage('Owner signed in successfully.')
  // ownerSignIn(@Body() dto: OwnerSignInDto) {
  //   return this.authenticationService.ownerSignIn(dto);
  // }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('pharmacies/first-register')
  @ResponseMessage('Pharmacy account activated successfully.')
  pharmacyFirstRegister(
    @Body() dto: FirstPharmacyRegisterDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.authenticationService.pharmacyFirstRegister(dto);
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('pharmacies/sign-in')
  @ResponseMessage('Pharmacy signed in successfully.')
  pharmacySignIn(@Body() dto: PharmacySignInDto) {
    return this.authenticationService.pharmacySignIn(dto);
  }
}
