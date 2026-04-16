import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsBoolean, IsOptional, Min, Length } from 'class-validator';

export class CreateEcheancierScolariteDto {
  @ApiProperty({ description: 'ID de la configuration scolarité' })
  @IsString()
  scolariteConfigId: string;

  @ApiProperty({ description: 'Numéro de l\'échéance (1 = inscription)', example: 1 })
  @IsNumber()
  @Min(1)
  numero: number;

  @ApiProperty({ description: 'Libellé de l\'échéance', example: 'Inscription' })
  @IsString()
  @Length(1, 255)
  libelle: string;

  @ApiProperty({ description: 'Montant dû pour cette échéance', example: 100000 })
  @IsNumber()
  @Min(0)
  montant: number;

  @ApiProperty({ description: 'Date limite de paiement', example: '2025-10-31' })
  @IsDateString()
  dateEcheance: string;

  @ApiPropertyOptional({ description: 'Est le versement d\'inscription', default: false })
  @IsOptional()
  @IsBoolean()
  estInscription?: boolean;

  @ApiPropertyOptional({ description: 'Notes ou instructions' })
  @IsOptional()
  @IsString()
  notes?: string;
}
