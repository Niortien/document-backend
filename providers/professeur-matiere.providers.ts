import { ProfesseurMatiere } from '../src/database/entities/professeur-matiere.entity';
import { DataSource } from 'typeorm';

export const professeurMatiereProviders = [
  {
    provide: 'PROFESSEUR_MATIERE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ProfesseurMatiere),
    inject: ['DATA_SOURCE'],
  },
];
