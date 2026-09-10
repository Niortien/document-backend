import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Mot de passe actuel', example: 'password123' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ description: 'Nouveau mot de passe', example: 'newPassword456' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
