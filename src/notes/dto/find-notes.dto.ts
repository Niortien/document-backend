import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';
import { StatutNote } from '../../database/entities/note-etudiant.entity';

export class FindNotesDto {
  @ApiPropertyOptional({ description: 'Année académique, ex: 2025-2026' })
  @IsOptional()
  @IsString()
  anneeAcademique?: string;

  @ApiPropertyOptional({ description: 'Filtrer par ID étudiant' })
  @IsOptional()
  @IsUUID()
  etudiantId?: string;

  @ApiPropertyOptional({ description: 'Filtrer par ID matière' })
  @IsOptional()
  @IsUUID()
  matiereId?: string;

  @ApiPropertyOptional({ description: 'Filtrer par ID filière (via étudiant)' })
  @IsOptional()
  @IsUUID()
  filiereId?: string;

  @ApiPropertyOptional({ description: 'Filtrer par ID niveau (via étudiant)' })
  @IsOptional()
  @IsUUID()
  niveauId?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par statut de la note',
    enum: StatutNote,
  })
  @IsOptional()
  @IsEnum(StatutNote)
  statut?: StatutNote;
  @ApiPropertyOptional({ description: 'Recherche par prénom ou nom de l\'étudiant (insensible à la casse)' })
  @IsOptional()
  @IsString()
  search?: string;}
