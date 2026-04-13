import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Filiere } from './filiere.entity';

@Entity()
export class Niveau {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @ManyToOne(() => Filiere, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'filiereId' })
  filiere: Filiere;

  @Column()
  filiereId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
