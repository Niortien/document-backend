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
import { Filiere } from './filiere.entity';
import { Niveau } from './niveau.entity';

/**
 * Représente l'affectation d'un professeur à une classe (filière + niveau).
 * Un professeur peut enseigner dans plusieurs classes.
 */
@Entity()
@Unique(['professeurId', 'filiereId', 'niveauId'])
export class ProfesseurClasse {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'professeurId' })
  professeur!: User;

  @Column()
  professeurId!: string;

  @ManyToOne(() => Filiere, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'filiereId' })
  filiere!: Filiere;

  @Column()
  filiereId!: string;

  @ManyToOne(() => Niveau, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'niveauId' })
  niveau!: Niveau;

  @Column()
  niveauId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
