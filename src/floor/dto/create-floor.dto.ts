import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFloorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string;
}
