import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TransportTypeAbonnement } from '../../database/entities/transport-abonnement.entity';

export class CreateTransportAbonnementDto {
  @ApiProperty({ description: "ID de l'étudiant" })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'ID de la configuration transport' })
  @IsString()
  transportConfigId: string;

  @ApiProperty({ description: "Type d'abonnement", enum: TransportTypeAbonnement, example: TransportTypeAbonnement.MENSUEL })
  @IsEnum(TransportTypeAbonnement)
  typeAbonnement: TransportTypeAbonnement;

  @ApiPropertyOptional({ description: 'Notes ou observations' })
  @IsOptional()
  @IsString()
  notes?: string;
}
