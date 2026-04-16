import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, Min, Length } from 'class-validator';

export class CreateTransportConfigDto {
  @ApiProperty({ description: 'Année académique', example: '2025-2026' })
  @IsString()
  @Length(1, 20)
  anneeAcademique: string;

  @ApiProperty({ description: 'Montant mensuel', example: 10000 })
  @IsNumber()
  @Min(0)
  montantMensuel: number;

  @ApiProperty({ description: 'Montant annuel', example: 100000 })
  @IsNumber()
  @Min(0)
  montantAnnuel: number;

  @ApiPropertyOptional({ description: 'Description ou itinéraire' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Actif ou non', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
