import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Filiere } from './filiere.entity';
import { Niveau } from './niveau.entity';

@Entity()
export class Matiere {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @ManyToOne(() => Filiere, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'filiereId' })
  filiere: Filiere;

  @Column()
  filiereId: string;

  @ManyToOne(() => Niveau, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'niveauId' })
  niveau: Niveau;

  @Column()
  niveauId: string;

  /** Coefficient de la matière (ou du module) */
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1 })
  coefficient: number;

  /**
   * true si cette matière est un module parent (ex: Mathématiques 1)
   * qui regroupe plusieurs sous-matières complémentaires.
   */
  @Column({ default: false })
  isModule: boolean;

  /** ID du module parent si cette matière est une sous-matière complémentaire */
  @Column({ type: 'varchar', nullable: true })
  parentId: string | null;

  /** Module parent (ex: Mathématiques 1) */
  @ManyToOne(() => Matiere, (m) => m.children, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parentId' })
  parent: Matiere | null;

  /** Sous-matières complémentaires (ex: Algèbre 1, Analyse 1) */
  @OneToMany(() => Matiere, (m) => m.parent)
  children: Matiere[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
