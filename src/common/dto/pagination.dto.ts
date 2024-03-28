import { IsNumber, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  page?: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  limit?: number;
}
