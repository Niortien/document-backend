import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignMatiereDto {
  @ApiProperty({ description: 'ID de la matière à assigner au professeur', example: 'uuid-matiere' })
  @IsUUID()
  matiereId!: string;
}
