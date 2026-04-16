import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransportAbonnement } from './transport-abonnement.entity';
import { User } from './user.entity';

@Entity('versement_transport')
export class VersementTransport {
  @ApiProperty({ description: 'Identifiant unique' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: "Abonnement transport de l'étudiant" })
  @ManyToOne(() => TransportAbonnement, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transportAbonnementId' })
  transportAbonnement: TransportAbonnement;

  @Column({ type: 'varchar' })
  transportAbonnementId: string;

  @ApiProperty({ description: 'Étudiant ayant effectué le versement' })
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar' })
  userId: string;

  @ApiProperty({ description: 'Montant versé', example: 10000 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montant: number;

  @ApiProperty({ description: 'Date du paiement' })
  @Column({ type: 'date' })
  datePaiement: Date;

  @ApiPropertyOptional({ description: 'Mois concerné (pour abonnement mensuel)', example: 'Janvier 2026' })
  @Column({ type: 'varchar', length: 50, nullable: true })
  moisConcerne: string | null;

  @ApiPropertyOptional({ description: 'Motif ou référence du versement' })
  @Column({ type: 'varchar', length: 500, nullable: true })
  motif: string | null;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
