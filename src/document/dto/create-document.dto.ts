import { IsString, IsUUID, IsEnum, IsOptional, Length } from 'class-validator';
import { DocumentType } from '../../database/entities/document.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({ description: 'Nom du document', example: 'Sujet examen Algo 2024', minLength: 1, maxLength: 255 })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ description: 'Type du document', enum: DocumentType, example: 'sujet_examen' })
  @IsEnum(DocumentType)
  type: DocumentType;

  @ApiProperty({ description: 'ID de la filière', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  filiereId: string;

  @ApiProperty({ description: 'ID du niveau', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  niveauId: string;

  @ApiPropertyOptional({ description: 'ID de la matière (optionnel)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsOptional()
  matiereId?: string;
}
