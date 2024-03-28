import {
  IsString,
  IsNotEmpty,
  IsPostalCode,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  streetAddress: string;

  @IsString()
  @IsOptional()
  addressLine2: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsPostalCode('any')
  @IsOptional()
  @Transform(({ value }) => value?.replace(/\s+/g, ''))
  zip: string;
}
