import { IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SaisirSessionDto {
  @ApiProperty({ description: 'Moyenne de session (/20)', example: 11.0 })
  @IsNumber()
  @Min(0)
  @Max(20)
  @Type(() => Number)
  moyenneSession: number;
}
