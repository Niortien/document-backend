import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateNoteDto {
  @ApiPropertyOptional({ description: 'Moyenne de classe (/20)', example: 12.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20)
  @Type(() => Number)
  moyenneClasse?: number;

  @ApiPropertyOptional({ description: 'Moyenne d\'examen (/20)', example: 14.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20)
  @Type(() => Number)
  moyenneExamen?: number;
}
