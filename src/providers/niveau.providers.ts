import { Niveau } from '../database/entities/niveau.entity';
import { DataSource } from 'typeorm';

export const niveauProviders = [
  {
    provide: 'NIVEAU_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Niveau),
    inject: ['DATA_SOURCE'],
  },
];
