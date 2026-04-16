import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateVersementTransportDto {
  @ApiProperty({ description: "ID de l'abonnement transport de l'étudiant" })
  @IsString()
  transportAbonnementId: string;

  @ApiProperty({ description: 'Montant versé', example: 10000 })
  @IsNumber()
  @Min(1)
  montant: number;

  @ApiProperty({ description: 'Date du paiement', example: '2026-01-15' })
  @IsDateString()
  datePaiement: string;

  @ApiPropertyOptional({ description: 'Mois concerné (pour abonnement mensuel)', example: 'Janvier 2026' })
  @IsOptional()
  @IsString()
  moisConcerne?: string;

  @ApiPropertyOptional({ description: 'Motif ou référence du versement' })
  @IsOptional()
  @IsString()
  motif?: string;
}
