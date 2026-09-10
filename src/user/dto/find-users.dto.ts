import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '../../database/entities/user.entity';

export class FindUsersDto {
  @ApiPropertyOptional({ description: 'Recherche par prénom ou nom (insensible à la casse)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrer par rôle', enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ description: 'Filtrer par ID filière' })
  @IsOptional()
  @IsUUID()
  filiereId?: string;

  @ApiPropertyOptional({ description: 'Filtrer par ID niveau' })
  @IsOptional()
  @IsUUID()
  niveauId?: string;

  @ApiPropertyOptional({ description: 'Filtrer par statut actif/inactif' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;
}
