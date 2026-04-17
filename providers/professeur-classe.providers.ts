import { ProfesseurClasse } from '../src/database/entities/professeur-classe.entity';
import { DataSource } from 'typeorm';

export const professeurClasseProviders = [
  {
    provide: 'PROFESSEUR_CLASSE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ProfesseurClasse),
    inject: ['DATA_SOURCE'],
  },
];
