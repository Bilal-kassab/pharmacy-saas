import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';
import { AccountType } from '../../../generated/prisma/enums';


export class CreateUserDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  fullName!: string;

  // Only ADMIN and MEDICAL_TEAM are allowed here.
  // PHARMACY_OWNER should not be created from this API.
  @IsIn([AccountType.ADMIN, AccountType.MEDICAL_TEAM,AccountType.PHARMACY_OWNER])
  accountType!: AccountType;
}