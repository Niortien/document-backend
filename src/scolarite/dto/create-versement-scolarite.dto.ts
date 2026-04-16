import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateVersementScolariteDto {
  @ApiProperty({ description: "ID du suivi scolarité de l'étudiant" })
  @IsString()
  scolariteEtudiantId: string;

  @ApiPropertyOptional({ description: 'ID de l\'échéance ciblée par ce versement' })
  @IsOptional()
  @IsString()
  echeanceEtudiantId?: string;

  @ApiProperty({ description: 'Montant du versement', example: 25000 })
  @IsNumber()
  @Min(1)
  montant: number;

  @ApiProperty({ description: 'Date du paiement', example: '2026-01-15' })
  @IsDateString()
  datePaiement: string;

  @ApiPropertyOptional({ description: 'Motif ou référence', example: 'Versement 1er trimestre' })
  @IsOptional()
  @IsString()
  motif?: string;
}
