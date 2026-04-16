import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScolariteEtudiant } from './scolarite-etudiant.entity';
import { EcheanceEtudiant } from './echeance-etudiant.entity';
import { User } from './user.entity';

@Entity('versement_scolarite')
export class VersementScolarite {
  @ApiProperty({ description: 'Identifiant unique' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Suivi scolarité de l\'étudiant' })
  @ManyToOne(() => ScolariteEtudiant, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scolariteEtudiantId' })
  scolariteEtudiant: ScolariteEtudiant;

  @Column({ type: 'varchar' })
  scolariteEtudiantId: string;

  @ApiProperty({ description: 'Étudiant ayant effectué le versement' })
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar' })
  userId: string;

  @ApiProperty({ description: 'Montant versé', example: 25000 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montant: number;

  @ApiProperty({ description: 'Date du paiement' })
  @Column({ type: 'date' })
  datePaiement: Date;

  @ApiPropertyOptional({ description: 'Motif ou référence du versement', example: 'Versement 1er trimestre' })
  @Column({ type: 'varchar', length: 500, nullable: true })
  motif: string | null;

  @ApiPropertyOptional({ description: 'Échéance ciblée par ce versement' })
  @ManyToOne(() => EcheanceEtudiant, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'echeanceEtudiantId' })
  echeanceEtudiant: EcheanceEtudiant | null;

  @Column({ type: 'varchar', nullable: true })
  echeanceEtudiantId: string | null;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
