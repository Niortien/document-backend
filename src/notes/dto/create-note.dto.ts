import { IsUUID, IsString, Length, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateNoteDto {
  @ApiProperty({ description: 'ID de l\'étudiant', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  etudiantId: string;

  @ApiProperty({ description: 'ID de la matière (sous-matière, non module)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  matiereId: string;

  @ApiProperty({ description: 'Année académique', example: '2025-2026' })
  @IsString()
  @Length(7, 12)
  anneeAcademique: string;

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
