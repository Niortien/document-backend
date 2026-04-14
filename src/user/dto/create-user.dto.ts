import { IsString, IsEmail, IsBoolean, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../database/entities/user.entity';

export class CreateUserDto {
  
  @ApiProperty({ description: 'First name of the user', example: 'John' })
  @IsString()
  firstName: string;
  
  @ApiProperty({ description: 'Last name of the user', example: 'Doe' })
  @IsString()
  lastName: string;
  
  @ApiProperty({ description: 'Email address of the user', example: 'john.doe@example.com' })
  @IsEmail()
  email: string;
  
  @ApiProperty({ description: 'Password for the user account', example: 'password123' })
  @IsString()
  password: string;
  
  @ApiPropertyOptional({ description: 'Whether the user account is active', default: true, example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Role de l\'utilisateur', enum: UserRole, default: UserRole.ETUDIANT, example: UserRole.ETUDIANT })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ description: 'ID de la filière de l\'étudiant', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsOptional()
  filiereId?: string;

  @ApiPropertyOptional({ description: 'ID du niveau de l\'étudiant', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsOptional()
  niveauId?: string;

  @ApiPropertyOptional({ description: 'URL de la photo de profil', example: 'uploads/photo.jpg' })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
