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


@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}
    

    @Auth(AuthType.None)
    @Post('user/sign-up')
    async userSignUp(@Body() signUpDto :SingUpDto){ 
        
    }

    @Auth(AuthType.None)
    @HttpCode(HttpStatus.OK)
    @Post('sign-in')
    async signIn(@Body() signInDto: SingInDto) {
      
    }

    // @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Get('profile')
   async getProfile(@ActiveUser() user: any) {
      // return user;
      const profile= await this.authenticationService.getProfile(user.sub);
      return {data:profile , message: 'Profile fetched successfully.'};
    }

   
    @Auth(AuthType.None)
    @HttpCode(HttpStatus.OK)
    @Post('refresh-token')
    async refreshTokens(@Body() refreshTokens: RefreshTokenDto) {
      const tokens=await this.authenticationService.refreshTokens(refreshTokens);
      return {data:tokens , message: 'Tokens refreshed successfully.'};
    }

}
