import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Matches, MaxLength, MinLength } from "class-validator";


export class SingUpDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @IsString()
  @MaxLength(180)
  fullName!: string;

  @IsString()
  @MinLength(20)
  @MaxLength(255)
  passwordHash!: string;

  // @IsOptional()
  // @IsEnum(AccountType)
  // accountType?: AccountType;

  // @IsOptional()
  // @IsEnum(UserAccountStatus)
  // status?: UserAccountStatus;
}
