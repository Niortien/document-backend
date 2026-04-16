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
import { ScolariteConfig } from './scolarite-config.entity';

@Entity('echeancier_scolarite')
export class EcheancierScolarite {
  @ApiProperty({ description: 'Identifiant unique' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Configuration scolarité associée' })
  @ManyToOne(() => ScolariteConfig, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scolariteConfigId' })
  scolariteConfig: ScolariteConfig;

  @Column({ type: 'varchar' })
  scolariteConfigId: string;

  @ApiProperty({ description: 'Numéro de l\'échéance (1 = inscription)', example: 1 })
  @Column({ type: 'int' })
  numero: number;

  @ApiProperty({ description: 'Libellé de l\'échéance', example: 'Inscription' })
  @Column({ length: 255 })
  libelle: string;

  @ApiProperty({ description: 'Montant dû pour cette échéance', example: 100000 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montant: number;

  @ApiProperty({ description: 'Date limite de paiement', example: '2025-10-31' })
  @Column({ type: 'date' })
  dateEcheance: Date;

  @ApiProperty({ description: 'Est le versement d\'inscription', default: false })
  @Column({ default: false })
  estInscription: boolean;

  @ApiPropertyOptional({ description: 'Notes ou instructions supplémentaires' })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
