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
import { ScolariteEtudiant } from './scolarite-etudiant.entity';
import { EcheancierScolarite } from './echeancier-scolarite.entity';
import { User } from './user.entity';

export enum EcheanceStatut {
  EN_ATTENTE = 'en_attente',
  PARTIEL = 'partiel',
  PAYE = 'paye',
  EN_RETARD = 'en_retard',
}

@Entity('echeance_etudiant')
export class EcheanceEtudiant {
  @ApiProperty({ description: 'Identifiant unique' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Scolarité de l\'étudiant' })
  @ManyToOne(() => ScolariteEtudiant, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scolariteEtudiantId' })
  scolariteEtudiant: ScolariteEtudiant;

  @Column({ type: 'varchar' })
  scolariteEtudiantId: string;

  @ApiProperty({ description: 'Étudiant concerné' })
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar' })
  userId: string;

  @ApiProperty({ description: 'Modèle d\'échéance (plan de la config)' })
  @ManyToOne(() => EcheancierScolarite, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'echeancierScolariteId' })
  echeancierScolarite: EcheancierScolarite | null;

  @Column({ type: 'varchar', nullable: true })
  echeancierScolariteId: string | null;

  @ApiProperty({ description: 'Numéro de l\'échéance', example: 1 })
  @Column({ type: 'int' })
  numero: number;

  @ApiProperty({ description: 'Libellé', example: 'Inscription' })
  @Column({ length: 255 })
  libelle: string;

  @ApiProperty({ description: 'Montant dû', example: 100000 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montantDu: number;

  @ApiProperty({ description: 'Montant déjà payé', default: 0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  montantPaye: number;

  @ApiProperty({ description: 'Date limite de paiement', example: '2025-10-31' })
  @Column({ type: 'date' })
  dateLimite: Date;

  @ApiProperty({ description: 'Statut de l\'échéance', enum: EcheanceStatut, example: EcheanceStatut.EN_ATTENTE })
  @Column({ type: 'enum', enum: EcheanceStatut, default: EcheanceStatut.EN_ATTENTE })
  statut: EcheanceStatut;

  @ApiPropertyOptional({ description: 'Notes' })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
