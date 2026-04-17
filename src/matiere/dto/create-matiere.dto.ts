import { IsString, IsUUID, Length, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMatiereDto {
  @ApiProperty({ description: 'Nom de la matière', example: 'Mathématiques 1', minLength: 1, maxLength: 255 })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ description: 'ID de la filière', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  filiereId: string;

  @ApiProperty({ description: 'ID du niveau', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  niveauId: string;

  @ApiPropertyOptional({ description: 'Coefficient de la matière', example: 3, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(20)
  @Type(() => Number)
  coefficient?: number;

  @ApiPropertyOptional({ description: 'Indique si cette matière est un module regroupant des sous-matières complémentaires', default: false })
  @IsOptional()
  @IsBoolean()
  isModule?: boolean;

  @ApiPropertyOptional({ description: 'ID du module parent (si cette matière est une sous-matière complémentaire)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
