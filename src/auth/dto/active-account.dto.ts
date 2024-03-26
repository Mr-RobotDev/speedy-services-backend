import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ActiveAccountDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
