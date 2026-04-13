import { IsString, IsEmail, IsBoolean, IsEnum, IsOptional } from 'class-validator';
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
}
