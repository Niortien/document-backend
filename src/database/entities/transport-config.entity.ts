import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('transport_config')
export class TransportConfig {
  @ApiProperty({ description: 'Identifiant unique' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Année académique', example: '2025-2026' })
  @Column({ length: 20 })
  anneeAcademique: string;

  @ApiProperty({ description: 'Montant mensuel', example: 10000 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montantMensuel: number;

  @ApiProperty({ description: 'Montant annuel', example: 100000 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montantAnnuel: number;

  @ApiPropertyOptional({ description: 'Description ou itinéraire', example: 'Ligne campus - centre ville' })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Actif ou non', default: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
