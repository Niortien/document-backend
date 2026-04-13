import { Matiere } from '../src/database/entities/matiere.entity';
import { DataSource } from 'typeorm';

export const matiereProviders = [
  {
    provide: 'MATIERE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Matiere),
    inject: ['DATA_SOURCE'],
  },
];
