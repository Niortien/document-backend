import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../database/entities/user.entity';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'First name of the user', example: 'John' })
  firstName?: string;
  
  @ApiPropertyOptional({ description: 'Last name of the user', example: 'Doe' })
  lastName?: string;
  
  @ApiPropertyOptional({ description: 'Email address of the user', example: 'john.doe@example.com' })
  email?: string;
  
  @ApiPropertyOptional({ description: 'Password for the user account', example: 'newpassword123' })
  password?: string;
  
  @ApiPropertyOptional({ description: 'Whether the user account is active', example: false })
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Role de l\'utilisateur', enum: UserRole, example: UserRole.ETUDIANT })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
