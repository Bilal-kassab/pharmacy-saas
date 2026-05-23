import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
// import { AuthType } from 'src/iam/authentication/enums/auth-type.enum';
import { AccessTokenGuard } from '../access-token/access-token.guard';
import { Reflector } from '@nestjs/core';
import { AuthType } from '../../authentication/enums/auth-type.enum';
import { AUTH__TYPE_KEY } from '../../authentication/decorators/auth.decorator';
// import { AUTH__TYPE_KEY } from 'src/iam/authentication/decorators/auth.decorator';

@Injectable()
export class AuthenticationGuard implements CanActivate {

  private static readonly defaultAuthTypes = AuthType.Bearer;

  private readonly authTypeGuardsMap: Record<
    AuthType,
    CanActivate | CanActivate[]
  >;

  constructor(
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly reflactor: Reflector,
  ) {
     this.authTypeGuardsMap = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.None]: { canActivate: () => true },
    };
  }

 async canActivate(
    context: ExecutionContext,
  ):Promise<boolean>{

    const authTypes =
      this.reflactor.getAllAndOverride<AuthType[]>(
        AUTH__TYPE_KEY,
        [context.getHandler(), context.getClass()],
      ) ?? [AuthenticationGuard.defaultAuthTypes];

      const guards=authTypes.map((type)=> this.authTypeGuardsMap[type]).flat();

      let error =new UnauthorizedException();

      for(const guard of guards){
        const canActive= await Promise.resolve(guard.canActivate(context),).catch((err)=>{
          error= err;
        });

        if(canActive){
          return true;
        }
      }
      throw error;
  }
}
