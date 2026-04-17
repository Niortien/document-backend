import { NoteEtudiant } from '../src/database/entities/note-etudiant.entity';
import { DataSource } from 'typeorm';

export const noteProviders = [
  {
    provide: 'NOTE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(NoteEtudiant),
    inject: ['DATA_SOURCE'],
  },
];
