import { IsString, IsUUID, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNiveauDto {
  @ApiProperty({ description: 'Niveau name', example: 'Bachelor 1', minLength: 1, maxLength: 255 })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ description: 'Filiere ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  filiereId: string;
}
