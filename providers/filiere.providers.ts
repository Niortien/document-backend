import { Filiere } from '../src/database/entities/filiere.entity';
import { DataSource } from 'typeorm';

export const filiereProviders = [
  {
    provide: 'FILIERE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Filiere),
    inject: ['DATA_SOURCE'],
  },
];
