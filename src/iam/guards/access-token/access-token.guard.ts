import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
// import jwtConfig from 'src/iam/config/jwt.config';
// import { REQUEST_USER_KEY } from 'src/iam/iam.constant';
import { Request } from 'express';
import jwtConfig from '../../config/jwt.config';
import { REQUEST_USER_KEY } from '../../iam.constant';
@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService, // to decode and verify JWTs with verifyAsync method
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>, // to access JWT-secret to decode methods
  ) {}

  // canActivate(
  //   context: ExecutionContext,
  // ): boolean | Promise<boolean> | Observable<boolean> {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      //  the verifyAsync method throws an error if the token is invalid or expired so we wrap it in a try-catch block
      // const payload = this.jwtService.verifyAsync(token,this.jwtConfiguration);
      const payload = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );

      if (payload.type === 'refresh' && request.url !== '/auth/refresh-token') {
        throw new UnauthorizedException('Refresh token not allowed here');
      }

      request[REQUEST_USER_KEY] = payload;
      // console.log("payload",payload);
    } catch (error:any) {
      throw new UnauthorizedException(error.message || 'Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [_, token] = request.headers.authorization?.split(' ') ?? []; // impoted Request from 'express'

    // return type === 'Bearer' ? token : undefined;
    return token;
  }
}
