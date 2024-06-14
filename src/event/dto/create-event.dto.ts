import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  value: string;

  @IsMongoId()
  @IsNotEmpty()
  device: string;
}
