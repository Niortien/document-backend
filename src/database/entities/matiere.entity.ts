import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
