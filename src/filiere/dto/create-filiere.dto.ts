import { IsString, IsBoolean, IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFiliereDto {
  @ApiProperty({ description: 'Filiere name', example: 'Computer Science', minLength: 1, maxLength: 255 })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ description: 'Filiere code', example: 'CS', minLength: 1, maxLength: 50 })
  @IsString()
  @Length(1, 50)
  code: string;

  @ApiPropertyOptional({ description: 'Whether the filiere is active', default: true, example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
