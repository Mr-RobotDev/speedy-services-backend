import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ActivateAccountDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
