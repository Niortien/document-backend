import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, Min, Length } from 'class-validator';

export class CreateScolariteConfigDto {
  @ApiProperty({ description: 'Année académique', example: '2025-2026' })
  @IsString()
  @Length(1, 20)
  anneeAcademique: string;

  @ApiProperty({ description: 'Montant total de la scolarité', example: 150000 })
  @IsNumber()
  @Min(0)
  montantTotal: number;

  @ApiProperty({ description: "Montant à verser à l'inscription", example: 50000 })
  @IsNumber()
  @Min(0)
  montantInscription: number;

  @ApiPropertyOptional({ description: 'Description', example: 'Frais L1 Informatique' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Actif ou non', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'ID de la filière' })
  @IsOptional()
  @IsString()
  filiereId?: string;

  @ApiPropertyOptional({ description: 'ID du niveau' })
  @IsOptional()
  @IsString()
  niveauId?: string;
}
