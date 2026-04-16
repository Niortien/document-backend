import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Filiere } from './filiere.entity';
import { Niveau } from './niveau.entity';

@Entity('scolarite_config')
export class ScolariteConfig {
  @ApiProperty({ description: 'Identifiant unique', example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Année académique', example: '2025-2026' })
  @Column({ length: 20 })
  anneeAcademique: string;

  @ApiProperty({ description: 'Montant total de la scolarité', example: 150000 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montantTotal: number;

  @ApiProperty({ description: "Montant à verser à l'inscription", example: 50000 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montantInscription: number;

  @ApiPropertyOptional({ description: 'Description ou notes', example: 'Frais de scolarité L1 Informatique' })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Actif ou non', default: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Filière concernée' })
  @ManyToOne(() => Filiere, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'filiereId' })
  filiere: Filiere | null;

  @Column({ type: 'varchar', nullable: true })
  filiereId: string | null;

  @ApiPropertyOptional({ description: 'Niveau concerné' })
  @ManyToOne(() => Niveau, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'niveauId' })
  niveau: Niveau | null;

  @Column({ type: 'varchar', nullable: true })
  niveauId: string | null;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
