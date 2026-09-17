import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { UserRole } from '../../database/entities/user.entity';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'First name of the user', example: 'John' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name of the user', example: 'Doe' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Email address of the user', example: 'john.doe@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Password for the user account', example: 'newpassword123' })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ description: 'Whether the user account is active', example: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Role de l\'utilisateur', enum: UserRole, example: UserRole.ETUDIANT })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ description: 'ID de la filière de l\'étudiant' })
  @IsUUID()
  @IsOptional()
  filiereId?: string;

  @ApiPropertyOptional({ description: 'ID du niveau de l\'étudiant' })
  @IsUUID()
  @IsOptional()
  niveauId?: string;

  @ApiPropertyOptional({ description: 'URL de la photo de profil' })
  @IsOptional()
  imageUrl?: string;
}
