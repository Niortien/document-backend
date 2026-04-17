import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Matiere } from './matiere.entity';

/**
 * Affectation d'un professeur à une matière précise.
 * Un professeur ne peut gérer les notes que des matières qui lui sont assignées.
 * La classe (filière + niveau) est déduite de la matière.
 */
@Entity()
@Unique(['professeurId', 'matiereId'])
export class ProfesseurMatiere {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'professeurId' })
  professeur!: User;

  @Column()
  professeurId!: string;

  @ManyToOne(() => Matiere, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'matiereId' })
  matiere!: Matiere;

  @Column()
  matiereId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
