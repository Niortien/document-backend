import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  ETUDIANT = 'etudiant',
  ADMIN = 'admin',
  PROFESSEUR = 'professeur',
}

@Entity()
export class User {
  @ApiProperty({ description: 'Unique identifier for the user', example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'First name of the user', example: 'John' })
  @Column({ length: 255 })
  firstName: string;

  @ApiProperty({ description: 'Last name of the user', example: 'Doe' })
  @Column({ length: 255 })
  lastName: string;

  @ApiProperty({ description: 'Email address of the user', example: 'john.doe@example.com' })
  @Column({ length: 255, unique: true })
  email: string;

  @ApiProperty({ description: 'Hashed password of the user' })
  @Column({ length: 255 })
  password: string;

  @ApiProperty({ description: 'Whether the user account is active', default: true, example: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Role de l\'utilisateur', enum: UserRole, example: UserRole.ETUDIANT })
  @Column({ type: 'enum', enum: UserRole, default: UserRole.ETUDIANT })
  role: UserRole;

  @ApiProperty({ description: 'Date when the user was created', example: '2023-01-01T00:00:00.000Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date when the user was last updated', example: '2023-01-01T00:00:00.000Z' })
  @UpdateDateColumn()
  updatedAt: Date;

 
}
