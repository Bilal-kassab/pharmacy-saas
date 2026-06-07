import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
export class SingInDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  // @IsString()
  // @IsNotEmpty()
  // @MaxLength(32)
  // phone!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(64)
  // @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
  //   message: 'Password must contain at least one letter and one number',
  // })
  password!: string;
}
