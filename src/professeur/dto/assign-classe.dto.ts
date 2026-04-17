import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignClasseDto {
  @ApiProperty({ description: 'ID de la filière', example: 'uuid-filiere' })
  @IsUUID()
  filiereId!: string;

  @ApiProperty({ description: 'ID du niveau', example: 'uuid-niveau' })
  @IsUUID()
  niveauId!: string;
}
