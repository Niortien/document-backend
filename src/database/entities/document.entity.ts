import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Filiere } from './filiere.entity';
import { Niveau } from './niveau.entity';
import { Matiere } from './matiere.entity';

export enum DocumentType {
  DEVOIR = 'devoir',
  SUJET_EXAMEN = 'sujet_examen',
  TD = 'td',
  TP = 'tp',
  SUPPORT_COURS = 'support_cours',
}

export enum FileType {
  PDF = 'pdf',
  IMAGE = 'image',
}

@Entity()
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'enum', enum: DocumentType })
  type: DocumentType;

  @Column({ type: 'enum', enum: FileType })
  fileType: FileType;

  @Column({ type: 'varchar', length: 500, nullable: true })
  fileUrl: string;

  @ManyToOne(() => Matiere, { eager: true, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'matiereId' })
  matiere: Matiere;

  @Column({ nullable: true })
  matiereId: string;

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
