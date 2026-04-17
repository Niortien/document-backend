import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Matiere } from './matiere.entity';

export enum StatutNote {
  EN_COURS = 'en_cours',
  VALIDE = 'valide',
  EN_SESSION = 'en_session',
  AJOURNE = 'ajourne',
}

@Entity()
@Unique(['etudiantId', 'matiereId', 'anneeAcademique'])
export class NoteEtudiant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'etudiantId' })
  etudiant: User;

  @Column()
  etudiantId: string;

  @ManyToOne(() => Matiere, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'matiereId' })
  matiere: Matiere;

  @Column()
  matiereId: string;

  /** Ex: "2025-2026" */
  @Column({ length: 12 })
  anneeAcademique: string;

  /**
   * Moyenne de classe (/20).
   * Contribue à 40% de la moyenne matière.
   */
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  moyenneClasse: number | null;

  /**
   * Moyenne d'examen (/20).
   * Contribue à 60% de la moyenne matière.
   */
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  moyenneExamen: number | null;

  /**
   * Moyenne matière calculée : moyenneClasse * 0.4 + moyenneExamen * 0.6.
   * Stockée pour faciliter les requêtes et le tri.
   */
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  moyenneMatiere: number | null;

  /**
   * Statut de l'étudiant dans cette matière :
   * - en_cours   : notes non encore complètes
   * - valide     : moyenne >= 10
   * - en_session : moyenne < 10, peut passer la session
   * - ajourne    : après session, encore < 10
   */
  @Column({ type: 'enum', enum: StatutNote, default: StatutNote.EN_COURS })
  statut: StatutNote;

  /**
   * Note de session (/20) — saisie uniquement si statut = en_session
   * et que la session a eu lieu.
   */
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  moyenneSession: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
