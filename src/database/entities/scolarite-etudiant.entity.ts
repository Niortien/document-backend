import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from './user.entity';
import { ScolariteConfig } from './scolarite-config.entity';

export enum ScolariteStatut {
  EN_COURS = 'en_cours',
  SOLDE = 'solde',
  EN_RETARD = 'en_retard',
}

@Entity('scolarite_etudiant')
export class ScolariteEtudiant {
  @ApiProperty({ description: 'Identifiant unique' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: "Étudiant concerné" })
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar' })
  userId: string;

  @ApiProperty({ description: 'Configuration de scolarité appliquée' })
  @ManyToOne(() => ScolariteConfig, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'scolariteConfigId' })
  scolariteConfig: ScolariteConfig;

  @Column({ type: 'varchar' })
  scolariteConfigId: string;

  @ApiProperty({ description: 'Année académique', example: '2025-2026' })
  @Column({ length: 20 })
  anneeAcademique: string;

  @ApiProperty({ description: 'Montant total à payer', example: 150000 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montantTotal: number;

  @ApiProperty({ description: 'Montant déjà payé', default: 0, example: 50000 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  montantPaye: number;

  @ApiProperty({ description: 'Statut de la scolarité', enum: ScolariteStatut, example: ScolariteStatut.EN_COURS })
  @Column({ type: 'enum', enum: ScolariteStatut, default: ScolariteStatut.EN_COURS })
  statut: ScolariteStatut;

  @ApiPropertyOptional({ description: 'Notes ou observations' })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
