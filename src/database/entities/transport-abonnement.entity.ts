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
import { User } from './user.entity';
import { TransportConfig } from './transport-config.entity';

export enum TransportStatut {
  ACTIF = 'actif',
  INACTIF = 'inactif',
  SOLDE = 'solde',
}

export enum TransportTypeAbonnement {
  MENSUEL = 'mensuel',
  ANNUEL = 'annuel',
}

@Entity('transport_abonnement')
export class TransportAbonnement {
  @ApiProperty({ description: 'Identifiant unique' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Étudiant abonné' })
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar' })
  userId: string;

  @ApiProperty({ description: 'Configuration transport appliquée' })
  @ManyToOne(() => TransportConfig, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'transportConfigId' })
  transportConfig: TransportConfig;

  @Column({ type: 'varchar' })
  transportConfigId: string;

  @ApiProperty({ description: 'Année académique', example: '2025-2026' })
  @Column({ length: 20 })
  anneeAcademique: string;

  @ApiProperty({ description: "Type d'abonnement", enum: TransportTypeAbonnement, example: TransportTypeAbonnement.MENSUEL })
  @Column({ type: 'enum', enum: TransportTypeAbonnement, default: TransportTypeAbonnement.MENSUEL })
  typeAbonnement: TransportTypeAbonnement;

  @ApiProperty({ description: 'Montant total à payer selon le type', example: 100000 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montantTotal: number;

  @ApiProperty({ description: 'Montant déjà payé', default: 0, example: 20000 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  montantPaye: number;

  @ApiProperty({ description: "Statut de l'abonnement", enum: TransportStatut, example: TransportStatut.ACTIF })
  @Column({ type: 'enum', enum: TransportStatut, default: TransportStatut.ACTIF })
  statut: TransportStatut;

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
