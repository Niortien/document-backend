import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, Length } from 'class-validator';

export class CreateScolariteEtudiantDto {
  @ApiProperty({ description: "ID de l'étudiant" })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'ID de la configuration de scolarité' })
  @IsString()
  scolariteConfigId: string;

  @ApiPropertyOptional({ description: 'Notes ou observations' })
  @IsOptional()
  @IsString()
  notes?: string;
}
