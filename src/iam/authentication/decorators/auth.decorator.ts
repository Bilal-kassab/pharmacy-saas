import { SetMetadata } from '@nestjs/common';
import { AuthType } from '../enums/auth-type.enum';

export const AUTH__TYPE_KEY = 'authType';

export const Auth = (...authTypes: AuthType[]) =>
  SetMetadata(AUTH__TYPE_KEY, authTypes);
